import Component from '@glimmer/component';
import type RdfaRelationshipEditor from './index';
import { SayController } from '@lblod/ember-rdfa-editor';
import { LinkTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import OutgoingTripleFormComponent from '../outgoing-triple-form';
import { action } from '@ember/object';

type Args = {
  triple?: LinkTriple;
  onCancel: () => void;
  onSave: RdfaRelationshipEditor['saveNewRelationship'];
  controller?: SayController;
};

export default class RelationshipEditorModal extends Component<Args> {
  OutgoingTripleForm = OutgoingTripleFormComponent;

  get controller() {
    return this.args.controller;
  }

  @action
  cancel() {
    this.args.onCancel();
  }

  save = (triple: LinkTriple) => {
    this.args.onSave(triple);
  };
}
