import { v4 as uuidv4 } from 'uuid';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { array } from '@ember/helper';
import { on } from '@ember/modifier';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import type RdfaRelationshipEditor from './index.gts';
import type { OutgoingTriple } from '#root/core/rdfa-processor.ts';
import OutgoingTripleForm from '../outgoing-triple-form.ts';
import type SayController from '#root/core/say-controller.ts';

type Sig = {
  Args: {
    triple?: OutgoingTriple;
    onCancel: () => void;
    onSave: RdfaRelationshipEditor['addProperty'];
    controller?: SayController;
    modalOpen: boolean;
    importedResources?: string[] | false;
  };
};

export default class RelationshipEditorModal extends Component<Sig> {
  @action
  cancel() {
    this.args.onCancel();
  }

  save = (triple: OutgoingTriple, subject?: string) => {
    this.args.onSave(triple, subject);
  };

  <template>
    {{! this was using unique-id but on our version of ember the exported helper seems to be undefined, so use uuid instead }}
    {{#let (uuidv4) as |formId|}}
      <AuModal
        @modalOpen={{@modalOpen}}
        @closable={{true}}
        @closeModal={{this.cancel}}
      >
        <:title>Add Relationship</:title>
        <:body>
          <OutgoingTripleForm
            id={{formId}}
            @onSubmit={{this.save}}
            @controller={{@controller}}
            @termTypes={{array "LiteralNode" "ResourceNode"}}
            @triple={{@triple}}
            @importedResources={{@importedResources}}
          />
        </:body>
        <:footer>
          <AuButtonGroup>
            <AuButton form={{formId}} type="submit">Save</AuButton>
            <AuButton
              @skin="secondary"
              {{on "click" this.cancel}}
            >Cancel</AuButton>
          </AuButtonGroup>
        </:footer>
      </AuModal>
    {{/let}}
  </template>
}
