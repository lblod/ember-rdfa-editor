import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type RdfaRelationshipEditor from './index';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  LinkTriple,
  NodeLinkObject,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import OutgoingTripleFormComponent from '../outgoing-triple-form';

const objectTypes = ['resource', 'literal'] as const;
type ObjectType = (typeof objectTypes)[number];

type Args = {
  onSave: RdfaRelationshipEditor['saveNewRelationship'];
  controller?: SayController;
};

//TODO: add datatype and language UI and handling here
export default class RelationshipEditorModal extends Component<Args> {
  objectTypes = objectTypes;

  OutgoingTripleForm = OutgoingTripleFormComponent;
  @tracked selectedObjectType: ObjectType = this.objectTypes[0];

  @tracked newPredicate = '';
  @tracked newDataType?: string;
  @tracked newLanguage?: string;
  @tracked objectRdfa?: NodeLinkObject;

  get controller() {
    return this.args.controller;
  }

  save = (triple: LinkTriple) => {
    this.args.onSave(triple);
  };
}
