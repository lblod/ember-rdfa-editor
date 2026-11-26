import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import {
  type Category,
  type Code,
  type Option,
  type RoadsignRegulationPluginOptions,
  type TypeOption,
  type Zonality,
} from '#root/plugin/types.ts';
import {
  countMobilityMeasures,
  type MobilityMeasureQueryOptions,
  queryMobilityMeasures,
} from '#root/plugin/queries/mobility-measure-concept.ts';
import queryRoadSignCategories from '#root/plugin/queries/road-sign-category.ts';
import queryTrafficSignalCodes from '#root/plugin/queries/traffic-signal-codes.ts';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import { pagination } from '@lblod/ember-rdfa-editor/helpers/pagination';
import { restartableTask, timeout } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import PowerSelect, {
  type Select,
} from 'ember-power-select/components/power-select';
import { type TaskInstance, trackedTask } from 'reactiveweb/ember-concurrency';
import { trackedFunction } from 'reactiveweb/function';
import RoadSignsTable from './roadsigns-table.gts';
import PaginationView from './pagination-view.gts';
import { not, or } from 'ember-truth-helpers';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '#root/plugin/constants.ts';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';

const DEBOUNCE_MS = 100;
const PAGE_SIZE = 20;

const trafficSignalConceptTypes = [
  {
    label: 'Verkeersborden',
    uri: TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN,
  },
  {
    label: 'Wegmarkeringen',
    uri: TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING,
  },
  {
    label: 'Verkeerslichten',
    uri: TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT,
  },
];

type Signature = {
  Args: {
    options: RoadsignRegulationPluginOptions;
    selectMeasureToInsert: (measure: MobilityMeasureConcept) => void;
    selectedZonality?: Zonality;
    changeSelectedZonality: (value: string | undefined) => void;
    selectedCode?: Code;
    changeCode: (value: Code) => void;
    selectedType?: TypeOption;
    changeType: (option: Option) => void;
    selectedCategory?: Category;
    changeCategory: (option: Option) => void;
    zonalityOptions: Zonality[];
    removeAllFilters: () => void;
    pageNumber: number;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
  };
};
export default class RoadsignsTableScreen extends Component<Signature> {
  pageSize = PAGE_SIZE;

  get endpoint() {
    return this.args.options.endpoint;
  }

  get imageBaseUrl() {
    return this.args.options.imageBaseUrl;
  }

  @action
  doFirstCodeSearch(select: Select) {
    if (
      this.searchCodes.isIdle &&
      !select.searchText &&
      // @ts-expect-error not part of the public API... (tested on PS 7 and 8)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.searchCodes.lastSuccessful?.args?.[0] !== ''
    ) {
      this.searchCodes.perform('').catch(console.error);
    }
    return true;
  }
  searchCodes = restartableTask(async (term: string) => {
    const category = this.args.selectedCategory?.uri;
    const type = this.args.selectedType?.uri;
    const types = type ? [type] : undefined;
    await timeout(DEBOUNCE_MS);
    return queryTrafficSignalCodes(this.endpoint, {
      searchString: term,
      roadSignCategory: category,
      types,
    });
  });

  classificationsQuery = trackedFunction(this, async () => {
    return queryRoadSignCategories(this.endpoint);
  });

  get classifications() {
    return this.classificationsQuery.value ?? [];
  }

  get typeOptions() {
    return trafficSignalConceptTypes;
  }

  get categoryOptions() {
    return this.classifications;
  }

  measureConceptsTask = restartableTask(async () => {
    const codes: Code[] = this.args.selectedCode
      ? [this.args.selectedCode]
      : [];
    const queryOptions: MobilityMeasureQueryOptions = {
      imageBaseUrl: this.imageBaseUrl,
      zonality: this.args.selectedZonality
        ? this.args.selectedZonality.uri
        : undefined,
      trafficSignalType: this.args.selectedType
        ? this.args.selectedType.uri
        : undefined,
      codes: codes.length ? codes.map((code) => code.uri) : undefined,
      category: this.args.selectedCategory
        ? this.args.selectedCategory.uri
        : undefined,
      page: this.args.pageNumber,
      pageSize: PAGE_SIZE,
    };
    await timeout(DEBOUNCE_MS);

    const abortController = new AbortController();
    try {
      const [measureConcepts, measureConceptCount] = await Promise.all([
        queryMobilityMeasures(this.endpoint, {
          ...queryOptions,
          abortSignal: abortController.signal,
        }),
        countMobilityMeasures(this.endpoint, {
          ...queryOptions,
          abortSignal: abortController.signal,
        }),
      ]);
      return {
        concepts: measureConcepts,
        count: measureConceptCount,
      };
    } finally {
      abortController.abort();
    }
  });

  measureConceptsQuery: TaskInstance<{
    concepts: MobilityMeasureConcept[];
    count: number;
  }> = trackedTask(this, this.measureConceptsTask, () => [
    this.args.selectedZonality,
    this.args.selectedType,
    this.args.selectedCode,
    this.args.selectedCategory,
    this.args.pageNumber,
  ]);

  get measureConcepts() {
    return this.measureConceptsQuery.value?.concepts;
  }

  get measureConceptCount() {
    return this.measureConceptsQuery.value?.count;
  }

  <template>
    <div class="au-o-grid au-u-height-full au-u-margin-none">
      <div
        class="au-o-box au-u-background-gray-100 au-o-grid__item au-u-1-3 au-u-1-4@medium au-u-1-5@large au-u-flex au-u-flex--column au-u-flex--between"
      >
        <div class="au-u-flex au-u-flex--column">
          <AuHeading @level="4" @skin="4" class="au-u-margin-bottom">
            {{t "editor-plugins.roadsign-regulation.modal.filter.heading"}}
          </AuHeading>
          <div class="au-u-margin-bottom">
            <AuLabel>
              {{t "editor-plugins.roadsign-regulation.modal.filter.code"}}
            </AuLabel>
            <PowerSelect
              @verticalPosition="below"
              @searchEnabled={{true}}
              @search={{this.searchCodes.perform}}
              @options={{or this.searchCodes.last.value undefined}}
              @selected={{@selectedCode}}
              @allowClear={{true}}
              @onChange={{@changeCode}}
              @onOpen={{this.doFirstCodeSearch}}
              as |option|
            >
              {{option.label}}
            </PowerSelect>
          </div>
          <div class="au-u-margin-bottom">
            <AuLabel>
              {{t "editor-plugins.roadsign-regulation.modal.filter.type"}}
            </AuLabel>
            <PowerSelect
              @verticalPosition="below"
              @options={{this.typeOptions}}
              @searchEnabled={{true}}
              @searchField="label"
              @selected={{@selectedType}}
              @allowClear={{true}}
              @onChange={{@changeType}}
              as |option|
            >
              {{option.label}}
            </PowerSelect>
          </div>
          <div class="au-u-margin-bottom">
            <AuLabel>
              {{t "editor-plugins.roadsign-regulation.modal.filter.category"}}
            </AuLabel>
            <PowerSelect
              @verticalPosition="below"
              @options={{this.categoryOptions}}
              @searchEnabled={{true}}
              @searchField="label"
              @selected={{@selectedCategory}}
              @allowClear={{true}}
              @onChange={{@changeCategory}}
              as |option|
            >
              {{option.label}}
            </PowerSelect>
          </div>
          <div>
            <AuLabel>
              {{t
                "editor-plugins.roadsign-regulation.modal.filter.zonal-validity"
              }}
            </AuLabel>
            <AuRadioGroup
              @selected={{@selectedZonality?.uri}}
              @onChange={{@changeSelectedZonality}}
              as |Group|
            >
              {{#each @zonalityOptions as |zonality|}}
                <Group.Radio
                  @value={{zonality.uri}}
                >{{zonality.label}}</Group.Radio>
              {{/each}}
            </AuRadioGroup>
          </div>
        </div>
        <div class="au-u-flex au-u-flex--end">
          <AuButton
            @skin="naked"
            @icon={{CrossIcon}}
            {{on "click" @removeAllFilters}}
          >
            {{t
              "editor-plugins.roadsign-regulation.modal.filter.clear-all-filters"
            }}
          </AuButton>
        </div>
      </div>
      <div
        class="au-c-body-container au-o-grid__item au-u-2-3 au-u-3-4@medium au-u-4-5@large au-u-padding-none"
      >
        <RoadSignsTable
          @content={{this.measureConcepts}}
          @isLoading={{this.measureConceptsQuery.isRunning}}
          @options={{@options}}
          @selectMeasureToInsert={{@selectMeasureToInsert}}
        />
        {{#if this.measureConceptCount}}
          {{#let
            (pagination
              page=@pageNumber
              pageSize=this.pageSize
              count=this.measureConceptCount
            )
            as |pg|
          }}
            <PaginationView
              @totalCount={{pg.count}}
              @rangeStart={{pg.pageStart}}
              @rangeEnd={{pg.pageEnd}}
              @onNextPage={{@goToNextPage}}
              @onPreviousPage={{@goToPreviousPage}}
              @isFirstPage={{not pg.hasPreviousPage}}
              @isLastPage={{not pg.hasNextPage}}
            />
          {{/let}}
        {{/if}}
      </div>
    </div>
  </template>
}
