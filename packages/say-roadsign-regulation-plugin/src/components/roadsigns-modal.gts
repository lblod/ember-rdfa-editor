import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';

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
import PowerSelectMultiple from 'ember-power-select/components/power-select-multiple';
import { type TaskInstance, trackedTask } from 'reactiveweb/ember-concurrency';
import { trackedFunction } from 'reactiveweb/function';
import RoadSignsTable from './roadsigns-table.gts';
import PaginationView from './pagination-view.gts';
import { not, or } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
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
import { getArticleNodes } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/document-structure-utils';

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
    modalOpen?: boolean;
    closeModal: () => void;
    controller: SayController;
    options: RoadsignRegulationPluginOptions;
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
  changeTypeOrCategory(option: Option) {
    if (!option) {
      this.selectedType = undefined;
      this.selectedCategory = undefined;
    } else {
      if (
        (
          this.trafficSignalConceptTypes.map((type) => type.uri) as string[]
        ).includes(option.uri)
      ) {
        this.selectedType = option;
        this.selectedCategory = undefined;
      } else {
        this.selectedType = undefined;
        this.selectedCategory = option;
      }
    }
    this.selectedCode = undefined;
    this.selectedCodeCombination = undefined;
    this.resetPagination();
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
  changeZonality(value: Zonality) {
    this.selectedZonality = value;
    this.resetPagination();
  }

  @action
  handleSearch(event: InputEvent) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.resetPagination();
  }

  @action
  closeModal() {
    this.args.closeModal();
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

  get typeOptions(): {
    groupName: string;
    options: TypeOption[];
  }[] {
    return [
      {
        groupName: 'Types',
        options: this.trafficSignalConceptTypes,
      },
      {
        groupName: 'Categorieën',
        options: this.classifications,
      },
    ];
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
      if (!this.decisionLocation) {
        return;
      }
      const abortController = new AbortController();
      try {
        const decisionUri = this.decisionLocation.node.attrs[
          'subject'
        ] as string;
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
            return insertMeasure({
              measureConcept: concept,
              variables: variableInstances,
              templateString: resolvedTemplate.templateString,
              articleUriGenerator: this.args.options.articleUriGenerator,
              decisionUri,
              zonality,
              temporal,
              position,
            })(this.controller.mainEditorState).transaction;
          },
          { view: this.controller.mainEditorView },
        );
        this.args.closeModal();
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

  get articleNodes() {
    return getArticleNodes(this.controller.mainEditorState).map(
      (node) => node.node,
    );
  }

  <template>
    <AuModal
      class="au-c-modal--flush"
      @size="large"
      @title={{t "editor-plugins.roadsign-regulation.modal.title"}}
      @modalOpen={{@modalOpen}}
      @closeModal={{this.closeModal}}
      as |Modal|
    >
      <Modal.Body>
        <div class="au-c-body-container">
          <div class="au-o-box au-u-background-gray-100">
            <div class="au-o-grid au-o-grid--tiny au-o-grid--bottom">
              <div class="au-o-grid__item au-u-1-4">
                <AuLabel>
                  {{t "editor-plugins.roadsign-regulation.modal.filter.type"}}
                </AuLabel>
                <PowerSelect
                  @renderInPlace={{true}}
                  @verticalPosition="below"
                  @options={{this.typeOptions}}
                  @searchEnabled={{true}}
                  @searchField="label"
                  @selected={{or this.selectedType this.selectedCategory}}
                  @allowClear={{true}}
                  @onChange={{this.changeTypeOrCategory}}
                  as |option|
                >
                  {{option.label}}
                </PowerSelect>
              </div>
              <div class="au-o-grid__item au-u-1-4">
                <AuLabel>
                  {{t "editor-plugins.roadsign-regulation.modal.filter.code"}}
                </AuLabel>
                <PowerSelect
                  @renderInPlace={{true}}
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
              <div class="au-o-grid__item au-u-1-4">
                <AuLabel>
                  {{t
                    "editor-plugins.roadsign-regulation.modal.combine-with-code"
                  }}
                </AuLabel>

                {{! WARNING: this explicit if/else works around a bug in either power-select or ember-source
                    possibly related to https://github.com/universal-ember/reactiveweb/issues/110
                    DO NOT optimize this unless you know what you're doing
                    It may seem like we can just pass codeCombinationOptions to the options
                    argument of powerselect here, but the reactivity will break and the options
                    will NOT recalculate when the main sign is selected. We have to explicitly
                    consume the value in the template and force powerselect to rerender.
                    Other tricks such as #let bindings also do not work. }}
                {{#if this.codeCombinationOptions.length}}
                  <PowerSelectMultiple
                    @renderInPlace={{true}}
                    @verticalPosition="below"
                    @searchEnabled={{true}}
                    @searchField="label"
                    @selected={{this.selectedCodeCombination}}
                    @allowClear={{true}}
                    @onChange={{this.changeCodeCombination}}
                    @options={{this.codeCombinationOptions}}
                    @disabled={{false}}
                    as |option|
                  >
                    {{option.label}}
                  </PowerSelectMultiple>
                {{else}}
                  <PowerSelectMultiple
                    @renderInPlace={{true}}
                    @verticalPosition="below"
                    @searchEnabled={{false}}
                    @selected={{this.selectedCodeCombination}}
                    @allowClear={{true}}
                    @onChange={{this.changeCodeCombination}}
                    @disabled={{true}}
                    as |option|
                  >
                    {{option.label}}
                  </PowerSelectMultiple>
                {{/if}}
              </div>
              <div class="au-o-grid__item au-u-1-4">
                <AuLabel>
                  {{t
                    "editor-plugins.roadsign-regulation.modal.filter.zonal-validity"
                  }}
                </AuLabel>
                <PowerSelect
                  @renderInPlace={{true}}
                  @verticalPosition="below"
                  @options={{this.zonalityOptions}}
                  @searchEnabled={{false}}
                  @selected={{this.selectedZonality}}
                  @allowClear={{true}}
                  @onChange={{this.changeZonality}}
                  as |option|
                >
                  {{option.label}}
                </PowerSelect>
              </div>
              <div class="au-o-grid__item au-u-1-4">
                <AuLabel>
                  {{t "editor-plugins.roadsign-regulation.modal.filter.text"}}
                </AuLabel>
                <AuInput
                  value={{this.searchQuery}}
                  {{on "input" this.handleSearch}}
                />
              </div>
            </div>
          </div>
          <RoadSignsTable
            @content={{this.measureConcepts}}
            @isLoading={{this.measureConceptsQuery.isRunning}}
            @insert={{this.insertMeasure}}
            @options={{@options}}
            @articleNodes={{this.articleNodes}}
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
      </Modal.Body>
    </AuModal>
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
