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
import { type RoadsignRegulationPluginOptions } from '#root/plugin/types.ts';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { ArrowLeftIcon } from '@appuniversum/ember-appuniversum/components/icons/arrow-left';
import { on } from '@ember/modifier';
import { type TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.ts';
import { type Instruction } from '#root/plugin/schemas/instruction.ts';
import {
  SelectedSign,
  type SelectedSigns,
} from '#root/plugin/selected-signs.ts';
import { type ZonalOrNot } from '#root/plugin/constants.ts';
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

  insertPositionOptionFirst: InsertPositionOption;
  insertPositionOptionLast: InsertPositionOption;

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
    const uris: string[] = [];
    for (const selection of this.selectedSigns.values()) {
      if (selection.mainSign.selectedInstruction) {
        uris.push(selection.mainSign.selectedInstruction.uri);
      }
      for (const subSign of selection.subSigns.values()) {
        if (subSign.selectedInstruction) {
          uris.push(subSign.selectedInstruction.uri);
        }
      }
    }
    return uris;
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
    if(!this.selectedSigns.values().length) return false;
    for(const mainSign of this.selectedSigns.values()) {
      if(!mainSign.instruction) {
        return false;
      }
      for (const subSign of mainSign.subSigns.values()) {
        if(!subSign.instruction) {
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
            @controller={{@controller}}
            @options={{@options}}
            @selectMeasureToInsert={{this.selectMeasureToInsert}}
          />
        {{else if (eq this.screen "insert")}}
          <RoadsignsInsertScreen
            @controller={{@controller}}
            @options={{@options}}
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
              <AuButton {{on "click" this.insert}} @disabled={{not this.canInsert}}>
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
