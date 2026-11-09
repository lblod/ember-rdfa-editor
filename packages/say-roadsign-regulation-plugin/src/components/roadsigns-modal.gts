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

  @action
  backToTable() {
    this.screen = 'table';
  }

  @action
  selectMeasureToInsert(measure: MobilityMeasureConcept) {
    this.screen = 'insert';
    this.measureToInsert = measure;
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
