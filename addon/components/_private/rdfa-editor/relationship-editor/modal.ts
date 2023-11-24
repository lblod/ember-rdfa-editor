import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type RdfaRelationshipEditor from './index';
import { SayController } from '@lblod/ember-rdfa-editor';
import { rdfaInfoPluginKey } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { ExternalPropertyObject } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

const typeChoices = ['existing', 'literal', 'resource'] as const;
export type AddRelationshipType = (typeof typeChoices)[number];

type Args = {
  onSave: RdfaRelationshipEditor['saveNewRelationship'];
  controller?: SayController;
};

export default class RelationshipEditorModal extends Component<Args> {
  types = typeChoices;

  @tracked addRelationshipType: AddRelationshipType = this.types[0];

  @tracked newPredicate = '';
  @tracked resourceUriBase = '';
  @tracked objectRdfa?: ExternalPropertyObject;

  get controller() {
    return this.args.controller;
  }

  get isAddExisting() {
    return this.addRelationshipType === 'existing';
  }

  get isAddResource() {
    return this.addRelationshipType === 'resource';
  }

  get rdfaIds() {
    if (!this.controller) throw Error('No Controller');
    const pluginState = rdfaInfoPluginKey.getState(
      this.controller.mainEditorState,
    );

    return pluginState
      ? [...pluginState.rdfaIdMapping.keys()].map((key) => {
          const node = unwrap(pluginState.rdfaIdMapping.get(key)?.value);
          const resource = node.attrs.resource as string;
          if (resource) {
            return { key, label: `Resource: ${resource} - [${key}]` };
          } else {
            return {
              key,
              label: `Literal: ${node.textContent.substring(
                0,
                20,
              )}... - [${key}]`,
            };
          }
        })
      : [];
  }

  updatePredicate = (event: InputEvent) => {
    this.newPredicate = (event.target as HTMLInputElement).value;
  };
  updateObject = (rdfaObj: ExternalPropertyObject) => {
    this.objectRdfa = rdfaObj;
  };
  updateUriBase = (event: InputEvent) => {
    this.resourceUriBase = (event.target as HTMLInputElement).value;
  };

  setAddType = (value: AddRelationshipType) => {
    this.addRelationshipType = value;
  };

  save = (event: Event) => {
    event.preventDefault();
    if (this.canSave) {
      if (this.addRelationshipType === 'existing') {
        this.args.onSave({
          type: this.addRelationshipType,
          predicate: this.newPredicate,
          object: unwrap(this.objectRdfa),
        });
      } else {
        this.args.onSave({
          type: this.addRelationshipType,
          predicate: this.newPredicate,
          uriBase: this.resourceUriBase,
        });
      }
    }
  };

  get canSave() {
    if (!this.newPredicate) return false;
    switch (this.addRelationshipType) {
      case 'existing':
        return !!this.objectRdfa;
      case 'resource':
        return !!this.resourceUriBase;
      case 'literal':
        return true;
      default:
        return false;
    }
  }
}
