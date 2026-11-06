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
import { restartableTask, task, timeout } from 'ember-concurrency';
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
  type ZonalOrNot,
} from '#root/plugin/constants.ts';
import { resolveTemplate } from '#root/plugin/actions/resolve-template.ts';
import { queryMobilityTemplates } from '#root/plugin/queries/mobility-template.ts';
import insertMeasure from '#root/plugin/actions/insert-measure.ts';
import { type Variable } from '#root/plugin/schemas/variable.ts';
import { generateVariableInstanceUri } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/variable-helpers';
import { mapObject } from '@lblod/ember-rdfa-editor/utils/map-utils';
import { v4 as uuid } from 'uuid';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';

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
  @tracked selectedCodeCombination?: Code[];
  @tracked selectedType?: TypeOption;
  @tracked selectedCategory?: Category;

  @tracked searchQuery?: string;

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
      this.selectedCodeCombination = undefined;
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
      this.selectedCodeCombination = undefined;
      this.resetPagination();
    }
  }

  @action
  changeCode(value: Code) {
    this.selectedCode = value;
    this.selectedCodeCombination = undefined;
    this.resetPagination();
  }

  @action
  changeCodeCombination(value: Code[]) {
    this.selectedCodeCombination = value;
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
  handleSearch(event: InputEvent) {
    this.searchQuery = (event.target as HTMLInputElement).value;
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
    const abortController = new AbortController();
    try {
      return queryTrafficSignalCodes(this.endpoint, {
        searchString: term,
        roadSignCategory: category,
        types,
      });
    } finally {
      abortController.abort();
    }
  });

  // Note: this code does not fully work/is not fully reactive with ember 5.6+
  // Check-out https://github.com/universal-ember/reactiveweb/issues/110 for more information
  codeCombinationOptionsQuery = trackedFunction(this, async () => {
    const selectedCode = this.selectedCode;
    if (!selectedCode) {
      return [];
    }
    let combinedWith: string[] = [selectedCode.uri];
    if (this.selectedCodeCombination) {
      combinedWith = [
        ...combinedWith,
        ...this.selectedCodeCombination.map((s) => s.uri),
      ];
    }
    return queryTrafficSignalCodes(this.endpoint, {
      combinedWith,
    });
  });

  get codeCombinationOptions() {
    return this.codeCombinationOptionsQuery.value ?? [];
  }

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
    const codes: Code[] = [];
    if (this.selectedCodeCombination) {
      codes.push(...this.selectedCodeCombination);
    }
    if (this.selectedCode) {
      codes.push(this.selectedCode);
    }
    const queryOptions: MobilityMeasureQueryOptions = {
      imageBaseUrl: this.imageBaseUrl,
      searchString: this.searchQuery,
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
    this.searchQuery,
    this.selectedZonality,
    this.selectedType,
    this.selectedCodeCombination,
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

  insertMeasure = task(
    async (
      concept: MobilityMeasureConcept,
      zonality: ZonalOrNot,
      temporal: boolean,
      position?: number,
    ) => {
      const decisionContext = this.args.options.decisionContext;
      const decisionUri =
        decisionContext?.decisionUri ??
        (this.decisionLocation?.node.attrs['subject'] as string);
      if (!decisionUri) {
        console.warn(
          'No decision URI available, unable to insert roadsign regulation',
        );
        return;
      }
      const abortController = new AbortController();
      try {
        const conceptTemplate = (
          await queryMobilityTemplates(this.endpoint, {
            measureConceptUri: concept.uri,
            abortSignal: abortController.signal,
          })
        )[0];
        const resolvedTemplate = await resolveTemplate(
          this.endpoint,
          conceptTemplate,
          {
            abortSignal: abortController.signal,
          },
        );
        const variableInstances = mapObject(
          resolvedTemplate.variables,
          ([key, variableOrVariableInstance]) => {
            return [key, instantiateVariable(variableOrVariableInstance)];
          },
        );
        this.controller.withTransaction(
          () => {
            const insertLocationArgs:
              | { position?: number; insertFreely: false }
              | { insertFreely: true } = decisionContext
              ? { insertFreely: true }
              : { insertFreely: false, position };
            return insertMeasure({
              measureConcept: concept,
              variables: variableInstances,
              templateString: resolvedTemplate.templateString,
              articleUriGenerator: this.args.options.articleUriGenerator,
              decisionUri,
              zonality,
              temporal,
              ...insertLocationArgs,
            })(this.controller.mainEditorState).transaction;
          },
          { view: this.controller.mainEditorView },
        );
        //this.args.closeModal();
      } finally {
        abortController.abort();
      }
    },
  );

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

  <template>
    <div class="au-o-grid au-u-height-full au-u-margin-none">
      <div class="au-o-box au-u-background-gray-100 au-o-grid__item au-u-1-5">
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

function instantiateVariable(
  variable: Exclude<Variable, { type: 'instruction' }>,
) {
  const __rdfaId = uuid();
  switch (variable.type) {
    case 'text':
      return {
        uri: generateVariableInstanceUri(),
        value: variable.defaultValue,
        variable,
        __rdfaId,
      };
    case 'number':
      return {
        uri: generateVariableInstanceUri(),
        value: variable.defaultValue,
        variable,
        __rdfaId,
      };
    case 'date':
      return {
        uri: generateVariableInstanceUri(),
        value: variable.defaultValue,
        variable,
        __rdfaId,
      };
    case 'location':
      return {
        uri: generateVariableInstanceUri(),
        value: variable.defaultValue,
        variable,
        __rdfaId,
      };
    case 'codelist':
      return {
        uri: generateVariableInstanceUri(),
        value: variable.defaultValue,
        valueLabel: variable.defaultValueLabel,
        variable,
        __rdfaId,
      };
  }
}
