import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type RdfaRelationshipEditor from './index';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  LinkTriple,
  NodeLinkObject,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import OutgoingTripleFormComponent from '../outgoing-triple-form';
import { action } from '@ember/object';

type Args = {
  triple?: LinkTriple;
  onSave: RdfaRelationshipEditor['saveNewRelationship'];
  onCancel: () => void;
  controller?: SayController;
};

export default class RelationshipEditorModal extends Component<Args> {
  OutgoingTripleForm = OutgoingTripleFormComponent;

  get controller() {
    return this.args.controller;
  }

  save = (triple: LinkTriple) => {
    this.args.onSave(triple);
  };
  @action
  cancel() {
    this.args.onCancel;
  }
}
