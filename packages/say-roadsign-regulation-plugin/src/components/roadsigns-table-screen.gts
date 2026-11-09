import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/decision-utils';
import { type RoadsignRegulationPluginOptions } from '#root/plugin/types.ts';
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
import {
  TRAFFIC_SIGNAL_CONCEPT_TYPES,
  ZONALITY_OPTIONS,
} from '#root/plugin/constants.ts';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';

type Option = {
  uri: string;
  label: string;
};

type Zonality = {
  uri: (typeof ZONALITY_OPTIONS)[keyof typeof ZONALITY_OPTIONS];
  label: string;
};
type TypeOption = Option;
type Code = Option;
type Category = Option;

const DEBOUNCE_MS = 100;
const PAGE_SIZE = 10;

type Signature = {
  Args: {
    controller: SayController;
    options: RoadsignRegulationPluginOptions;
    selectMeasureToInsert: (measure: MobilityMeasureConcept) => void;
  };
};
export default class RoadsignsModal extends Component<Signature> {
  pageSize = PAGE_SIZE;
  @tracked pageNumber = 0;

  @tracked selectedZonality?: Zonality;
  @tracked selectedCode?: Code;
  @tracked selectedType?: TypeOption;
  @tracked selectedCategory?: Category;

  zonalityOptions: Zonality[] = [
    {
      uri: ZONALITY_OPTIONS.ZONAL,
      label: 'Zonaal',
    },
    {
      uri: ZONALITY_OPTIONS.NON_ZONAL,
      label: 'Niet zonaal',
    },
  ];

  get endpoint() {
    return this.args.options.endpoint;
  }

  get imageBaseUrl() {
    return this.args.options.imageBaseUrl;
  }

  get controller() {
    return this.args.controller;
  }

  get decisionLocation() {
    const decisionRange = getCurrentBesluitRange(this.controller);
    return decisionRange
      ? { node: decisionRange.node, pos: decisionRange.from }
      : null;
  }

  @action
  changeType(option: Option) {
    if (!option) {
      this.selectedType = undefined;
    } else {
      this.selectedType = option;
      this.selectedCategory = undefined;
      this.selectedCode = undefined;
      this.resetPagination();
    }
  }

  @action
  changeCategory(option: Option) {
    if (!option) {
      this.selectedCategory = undefined;
    } else {
      this.selectedCategory = option;
      this.selectedCode = undefined;
      this.resetPagination();
    }
  }

  @action
  changeCode(value: Code) {
    this.selectedCode = value;
    this.resetPagination();
  }

  @action
  changeZonality(value: string | undefined) {
    const zonality = this.zonalityOptions.find(
      (option) => option.uri === value,
    );
    this.selectedZonality = zonality;
    this.resetPagination();
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
    const category = this.selectedCategory?.uri;
    const type = this.selectedType?.uri;
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

  trafficSignalConceptTypes = [
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

  get typeOptions() {
    return this.trafficSignalConceptTypes;
  }

  get categoryOptions() {
    return this.classifications;
  }

  measureConceptsTask = restartableTask(async () => {
    const codes: Code[] = this.selectedCode ? [this.selectedCode] : [];
    const queryOptions: MobilityMeasureQueryOptions = {
      imageBaseUrl: this.imageBaseUrl,
      zonality: this.selectedZonality ? this.selectedZonality.uri : undefined,
      trafficSignalType: this.selectedType ? this.selectedType.uri : undefined,
      codes: codes.length ? codes.map((code) => code.uri) : undefined,
      category: this.selectedCategory ? this.selectedCategory.uri : undefined,
      page: this.pageNumber,
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
    this.selectedZonality,
    this.selectedType,
    this.selectedCode,
    this.selectedCategory,
    this.pageNumber,
  ]);

  get measureConcepts() {
    return this.measureConceptsQuery.value?.concepts;
  }

  get measureConceptCount() {
    return this.measureConceptsQuery.value?.count;
  }

  @action
  resetPagination() {
    this.goToPage(0);
  }

  @action
  goToPreviousPage() {
    this.goToPage(this.pageNumber - 1);
  }

  @action
  goToNextPage() {
    this.goToPage(this.pageNumber + 1);
  }

  @action
  goToPage(pageNumber: number) {
    this.pageNumber = pageNumber;
  }

  @action
  removeAllFilters() {
    this.selectedZonality = undefined;
    this.selectedType = undefined;
    this.selectedCode = undefined;
    this.selectedCategory = undefined;
    this.resetPagination();
  }

  <template>
    <div class="au-o-grid au-u-height-full au-u-margin-none">
      <div
        class="au-o-box au-u-background-gray-100 au-o-grid__item au-u-1-5 au-u-flex au-u-flex--column au-u-flex--between"
      >
        <div class="au-u-flex au-u-flex--column au-u-padding">
          <div class="au-u-margin-bottom">
            <AuLabel>
              {{t "editor-plugins.roadsign-regulation.modal.filter.code"}}
            </AuLabel>
            <PowerSelect
              @verticalPosition="below"
              @searchEnabled={{true}}
              @search={{this.searchCodes.perform}}
              @options={{or this.searchCodes.last.value undefined}}
              @selected={{this.selectedCode}}
              @allowClear={{true}}
              @onChange={{this.changeCode}}
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
              @selected={{this.selectedType}}
              @allowClear={{true}}
              @onChange={{this.changeType}}
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
              @selected={{this.selectedCategory}}
              @allowClear={{true}}
              @onChange={{this.changeCategory}}
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
              @selected={{this.selectedZonality.uri}}
              @onChange={{this.changeZonality}}
              as |Group|
            >
              {{#each this.zonalityOptions as |zonality|}}
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
            {{on "click" this.removeAllFilters}}
          >
            {{t
              "editor-plugins.roadsign-regulation.modal.filter.clear-all-filters"
            }}
          </AuButton>
        </div>
      </div>
      <div
        class="au-c-body-container au-o-grid__item au-u-4-5 au-u-padding-none"
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
              page=this.pageNumber
              pageSize=this.pageSize
              count=this.measureConceptCount
            )
            as |pg|
          }}
            <PaginationView
              @totalCount={{pg.count}}
              @rangeStart={{pg.pageStart}}
              @rangeEnd={{pg.pageEnd}}
              @onNextPage={{this.goToNextPage}}
              @onPreviousPage={{this.goToPreviousPage}}
              @isFirstPage={{not pg.hasPreviousPage}}
              @isLastPage={{not pg.hasNextPage}}
            />
          {{/let}}
        {{/if}}
      </div>
    </div>
  </template>
}
