import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import t from 'ember-intl/helpers/t';
import { eq, not } from 'ember-truth-helpers';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import { v4 as uuid } from 'uuid';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import RoadsignsTableScreen from '#root/components/roadsigns-table-screen.gts';
import RoadsignsInsertScreen, {
  type InsertPositionOption,
} from '#root/components/roadsigns-insert-screen.gts';
import {
  type Category,
  type Code,
  type Option,
  type RoadsignRegulationPluginOptions,
  type TypeOption,
  type Zonality,
} from '#root/plugin/types.ts';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { ArrowLeftIcon } from '@appuniversum/ember-appuniversum/components/icons/arrow-left';
import { on } from '@ember/modifier';
import { type TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.ts';
import { type Instruction } from '#root/plugin/schemas/instruction.ts';
import {
  SelectedSign,
  type SelectedSigns,
} from '#root/plugin/selected-signs.ts';
import { type ZonalOrNot, ZONALITY_OPTIONS } from '#root/plugin/constants.ts';
import insertMeasure from '#root/plugin/actions/insert-measure.ts';
import { queryVariables } from '#root/plugin/queries/variable.ts';
import { type Variable } from '#root/plugin/schemas/variable.ts';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/decision-utils';
import { getArticleNodes } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/document-structure-utils';
import {
  generateVariableInstanceUri,
  generateVariableUri,
} from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/variable-helpers';
import { mapObject } from '@lblod/ember-rdfa-editor/utils/map-utils';

type Signature = {
  Args: {
    modalOpen?: boolean;
    closeModal: () => void;
    controller: SayController;
    options: RoadsignRegulationPluginOptions;
  };
};
export default class RoadsignsModal extends Component<Signature> {
  @service declare intl: IntlService;

  @tracked screen = 'table';
  @tracked measureToInsert?: MobilityMeasureConcept;
  @tracked selectedSigns: SelectedSigns = new Map();

  @tracked zonalityValue?: ZonalOrNot;
  @tracked temporalValue?: boolean;
  @tracked selectedInsertPosition: InsertPositionOption;

  @tracked pageNumber = 0;

  @tracked selectedZonality?: Zonality;
  @tracked selectedCode?: Code;
  @tracked selectedType?: TypeOption;
  @tracked selectedCategory?: Category;

  insertPositionOptionFirst: InsertPositionOption;
  insertPositionOptionLast: InsertPositionOption;

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

  constructor(owner: unknown, args: Signature['Args']) {
    super(owner, args);
    this.insertPositionOptionFirst = {
      label: this.intl.t(
        'editor-plugins.roadsign-regulation.expanded-measure.as-first-article',
      ),
      position: 'first',
      insertIndex: 0,
    };
    this.insertPositionOptionLast = {
      label: this.intl.t(
        'editor-plugins.roadsign-regulation.expanded-measure.as-last-article',
      ),
      position: 'last',
    };
    this.selectedInsertPosition = this.insertPositionOptionLast;
  }

  get endpoint() {
    return this.args.options.endpoint;
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

  get articlesInDocument() {
    return getArticleNodes(this.controller.mainEditorState).map(
      (node) => node.node,
    );
  }

  get insertPositionOptions() {
    return [
      this.insertPositionOptionLast,
      this.insertPositionOptionFirst,
      ...this.articlesInDocument.slice(1).map((_, index) => ({
        label: this.intl.t(
          'editor-plugins.roadsign-regulation.expanded-measure.after-article-x',
          { articleNumber: index + 1 },
        ),
        position: 'custom' as const,
        insertIndex: index + 1,
      })),
    ];
  }

  get template() {
    const lines: string[] = [];
    const selections = [...this.selectedSigns.values()];
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      const line: string[] = [`\${${locatieLabel(i)}}`];
      if (selection.mainSign.selectedInstruction) {
        line.push(selection.mainSign.selectedInstruction.value);
      }
      for (const subSign of selection.subSigns.values()) {
        if (subSign.selectedInstruction) {
          line.push(subSign.selectedInstruction.value);
        }
      }
      lines.push(line.join(' '));
    }
    return lines.join(';\n');
  }

  get selectedInstructionUris() {
    const uris: Set<string> = new Set();
    for (const selection of this.selectedSigns.values()) {
      if (selection.mainSign.selectedInstruction) {
        uris.add(selection.mainSign.selectedInstruction.uri);
      }
      for (const subSign of selection.subSigns.values()) {
        if (subSign.selectedInstruction) {
          uris.add(subSign.selectedInstruction.uri);
        }
      }
    }
    return [...uris];
  }

  @action
  backToTable() {
    this.screen = 'table';
  }

  @action
  selectMeasureToInsert(measure: MobilityMeasureConcept) {
    this.screen = 'insert';
    this.measureToInsert = measure;
    this.selectedSigns = new Map();
    this.zonalityValue = undefined;
    this.temporalValue = undefined;
    this.selectedInsertPosition = this.insertPositionOptionLast;
  }

  @action
  selectSubSign(subSign: TrafficSignalConcept, mainSign: TrafficSignalConcept) {
    const selection = this.selectedSigns.get(mainSign.uri);
    const subSigns = new Map(selection?.subSigns);
    if (subSigns.has(subSign.uri)) {
      subSigns.delete(subSign.uri);
    } else {
      subSigns.set(subSign.uri, new SelectedSign(subSign));
    }
    this.selectedSigns = new Map(this.selectedSigns).set(mainSign.uri, {
      // Keep the main sign to preserve the instruction
      mainSign: selection?.mainSign ?? new SelectedSign(mainSign),
      subSigns,
    });
  }

  @action
  selectMainSign(mainSign: TrafficSignalConcept) {
    if (this.selectedSigns.has(mainSign.uri)) {
      this.selectedSigns = new Map(
        [...this.selectedSigns].filter(([uri]) => uri !== mainSign.uri),
      );
    } else {
      this.selectedSigns = new Map(this.selectedSigns).set(mainSign.uri, {
        mainSign: new SelectedSign(mainSign),
        subSigns: new Map(),
      });
    }
  }

  @action
  selectInstruction(selectedSign: SelectedSign, instruction: Instruction) {
    selectedSign.selectedInstruction = instruction;
  }

  @action
  changeZonality(zonality: ZonalOrNot) {
    this.zonalityValue = zonality;
  }

  @action
  changeTemporality(temporality: 'true' | 'false') {
    this.temporalValue = temporality === 'true';
  }

  @action
  selectInsertPosition(option: InsertPositionOption) {
    this.selectedInsertPosition = option;
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
  changeSelectedZonality(value: string | undefined) {
    const zonality = this.zonalityOptions.find(
      (option) => option.uri === value,
    );
    this.selectedZonality = zonality;
    this.resetPagination();
  }

  @action
  removeAllFilters() {
    this.selectedZonality = undefined;
    this.selectedType = undefined;
    this.selectedCode = undefined;
    this.selectedCategory = undefined;
    this.resetPagination();
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
        const instructionVariables = (
          await Promise.all(
            this.selectedInstructionUris.map((uri) =>
              queryVariables(this.endpoint, {
                templateUri: uri,
                abortSignal: abortController.signal,
              }),
            ),
          )
        ).flat();
        const locatieVariables: Variable[] = [];
        for (let i = 0; i < this.selectedSigns.size; i++) {
          locatieVariables.push({
            uri: generateVariableUri(),
            label: locatieLabel(i),
            type: 'location',
            source: this.endpoint,
          });
        }
        const variables = [...instructionVariables, ...locatieVariables].reduce<
          Record<string, Exclude<Variable, { type: 'instruction' }>>
        >((result, item) => {
          if (item.type !== 'instruction') {
            return {
              ...result,
              [item.label]: item,
            };
          } else {
            return result;
          }
        }, {});
        const variableInstances = mapObject(variables, ([key, variable]) => {
          return [key, instantiateVariable(variable)];
        });
        this.controller.withTransaction(
          () => {
            return insertMeasure({
              measureConcept: concept,
              variables: variableInstances,
              templateString: this.template,
              articleUriGenerator: this.args.options.articleUriGenerator,
              decisionUri,
              zonality,
              temporal,
              position,
            })(this.controller.mainEditorState).transaction;
          },
          { view: this.controller.mainEditorView },
        );
        this.closeModal();
        this.args.closeModal();
      } finally {
        abortController.abort();
      }
    },
  );

  @action
  insert() {
    if (!this.measureToInsert) {
      return;
    }
    const { insertIndex } = this.selectedInsertPosition;
    void this.insertMeasure.perform(
      this.measureToInsert,
      // POTENTIALLY_ZONAL option is filtered out by requiring a zonalityValue to submit
      (this.zonalityValue ?? this.measureToInsert.zonality) as ZonalOrNot,
      this.temporalValue ?? false,
      insertIndex,
    );
  }

  get canInsert() {
    if (
      this.measureToInsert?.zonality === ZONALITY_OPTIONS.POTENTIALLY_ZONAL &&
      !this.zonalityValue
    )
      return false;
    if (
      this.measureToInsert?.variableSignage &&
      this.temporalValue === undefined
    )
      return false;
    if (!this.selectedSigns.size) return false;
    for (const selectedSign of this.selectedSigns.values()) {
      if (!selectedSign.mainSign.selectedInstruction) {
        return false;
      }
      for (const subSign of selectedSign.subSigns.values()) {
        if (!subSign.selectedInstruction) {
          return false;
        }
      }
    }
    return true;
  }

  @action
  closeModal() {
    this.screen = 'table';
    this.measureToInsert = undefined;
    this.selectedSigns = new Map();
    this.zonalityValue = undefined;
    this.temporalValue = undefined;
    this.selectedInsertPosition = this.insertPositionOptionLast;
    this.selectedZonality = undefined;
    this.selectedType = undefined;
    this.selectedCode = undefined;
    this.selectedCategory = undefined;
    this.pageNumber = 0;
    this.args.closeModal();
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
        {{#if (eq this.screen "table")}}
          <RoadsignsTableScreen
            @options={{@options}}
            @selectMeasureToInsert={{this.selectMeasureToInsert}}
            @selectedZonality={{this.selectedZonality}}
            @changeSelectedZonality={{this.changeSelectedZonality}}
            @selectedCode={{this.selectedCode}}
            @changeCode={{this.changeCode}}
            @selectedType={{this.selectedType}}
            @changeType={{this.changeType}}
            @selectedCategory={{this.selectedCategory}}
            @changeCategory={{this.changeCategory}}
            @zonalityOptions={{this.zonalityOptions}}
            @removeAllFilters={{this.removeAllFilters}}
            @pageNumber={{this.pageNumber}}
            @goToNextPage={{this.goToNextPage}}
            @goToPreviousPage={{this.goToPreviousPage}}
          />
        {{else if (eq this.screen "insert")}}
          <RoadsignsInsertScreen
            @measureToInsert={{this.measureToInsert}}
            @selectedSigns={{this.selectedSigns}}
            @selectMainSign={{this.selectMainSign}}
            @selectSubSign={{this.selectSubSign}}
            @selectInstruction={{this.selectInstruction}}
            @template={{this.template}}
            @zonalityValue={{this.zonalityValue}}
            @changeZonality={{this.changeZonality}}
            @temporalValue={{this.temporalValue}}
            @changeTemporality={{this.changeTemporality}}
            @selectedInsertPosition={{this.selectedInsertPosition}}
            @selectInsertPosition={{this.selectInsertPosition}}
            @insertPositionOptions={{this.insertPositionOptions}}
          />
        {{/if}}

      </Modal.Body>
      {{#if (eq this.screen "insert")}}
        <Modal.Footer>
          <div class="au-u-flex au-u-flex--between">
            <AuButton
              @skin="link"
              @icon={{ArrowLeftIcon}}
              {{on "click" this.backToTable}}
            >
              {{t "editor-plugins.roadsign-regulation.insert.go-back"}}
            </AuButton>
            <div>
              <AuButton @skin="naked" {{on "click" this.closeModal}}>
                {{t "editor-plugins.roadsign-regulation.modal.cancel"}}
              </AuButton>
              <AuButton
                {{on "click" this.insert}}
                @disabled={{not this.canInsert}}
                @loading={{this.insertMeasure.isRunning}}
              >
                {{t "editor-plugins.roadsign-regulation.modal.insert"}}
              </AuButton>
            </div>
          </div>
        </Modal.Footer>
      {{/if}}
    </AuModal>
  </template>
}

function locatieLabel(index: number) {
  return index === 0 ? 'locatie' : `locatie${index + 1}`;
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
