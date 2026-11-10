import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import t from 'ember-intl/helpers/t';
import { eq } from 'ember-truth-helpers';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import RoadsignsTableScreen from '#root/components/roadsigns-table-screen.gts';
import RoadsignsInsertScreen from '#root/components/roadsigns-insert-screen.gts';
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

type Signature = {
  Args: {
    modalOpen?: boolean;
    closeModal: () => void;
    controller: SayController;
    options: RoadsignRegulationPluginOptions;
  };
};
export default class RoadsignsModal extends Component<Signature> {
  @tracked screen = 'table';
  @tracked measureToInsert?: MobilityMeasureConcept;
  @tracked selectedSigns: SelectedSigns = new Map();

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

  get template() {
    const lines: string[] = [];
    const selections = [...this.selectedSigns.values()];
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      const line: string[] = [`\${locatie${i === 0 ? '' : i + 1}}`];
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
    return lines.join('\n');
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

  // TODO: move the insert logic here
  @action
  insert() {
    this.closeModal();
  }

  @action
  closeModal() {
    this.screen = 'table';
    this.measureToInsert = undefined;
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
              <AuButton {{on "click" this.insert}}>
                {{t "editor-plugins.roadsign-regulation.modal.insert"}}
              </AuButton>
            </div>
          </div>
        </Modal.Footer>
      {{/if}}
    </AuModal>
  </template>
}
