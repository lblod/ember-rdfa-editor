import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type RdfaRelationshipEditor from './index';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  getNodeByRdfaId,
  getResources,
  rdfaInfoPluginKey,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { ExternalPropertyObject } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

const objectTypes = ['resource', 'literal'] as const;
type ObjectType = (typeof objectTypes)[number];

type Args = {
  onSave: RdfaRelationshipEditor['saveNewRelationship'];
  controller?: SayController;
};

export default class RelationshipEditorModal extends Component<Args> {
  objectTypes = objectTypes;

  @tracked selectedObjectType: ObjectType = this.objectTypes[0];

  @tracked newPredicate = '';
  @tracked resourceUriBase = '';
  @tracked objectRdfa?: ExternalPropertyObject;

  get controller() {
    return this.args.controller;
  }

  get dropdownPlaceholder() {
    if (this.selectedObjectType === 'resource') {
      return 'Select an existing resource or create a new one';
    } else {
      return 'Select an existing literal or create a new one';
    }
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

  get literals(): ExternalPropertyObject[] {
    if (!this.controller) throw Error('No Controller');
    const rdfaIdMapping = rdfaInfoPluginKey.getState(
      this.controller.mainEditorState,
    )?.rdfaIdMapping;
    if (!rdfaIdMapping) {
      return [];
    }
    const result: ExternalPropertyObject[] = [];
    rdfaIdMapping.forEach((resolvedNode, rdfaId) => {
      if (resolvedNode.value.attrs.rdfaNodeType === 'literal') {
        result.push({
          type: 'literal',
          rdfaId,
        });
      }
    });
    return result;
  }

  get resources(): ExternalPropertyObject[] {
    if (!this.controller) throw Error('No Controller');
    return getResources(this.controller.mainEditorState).map((resource) => {
      return {
        type: 'resource',
        resource,
      };
    });
  }

  label = (rdfaObject: ExternalPropertyObject) => {
    if (!this.controller) throw Error('No Controller');
    console.log(rdfaObject);
    if (rdfaObject.type === 'resource') {
      return rdfaObject.resource;
    } else {
      const node = unwrap(
        getNodeByRdfaId(this.controller.mainEditorState, rdfaObject.rdfaId),
      );
      const content = node.value.textContent;
      const truncatedContent =
        content.length <= 20 ? content : `${content.substring(0, 20)}...`;
      return `${truncatedContent} (${rdfaObject.rdfaId})`;
    }
  };

  updatePredicate = (event: InputEvent) => {
    this.newPredicate = (event.target as HTMLInputElement).value;
  };
  updateObject = (rdfaObj?: ExternalPropertyObject) => {
    this.objectRdfa = rdfaObj;
  };
  updateUriBase = (event: InputEvent) => {
    this.resourceUriBase = (event.target as HTMLInputElement).value;
  };

  setObjectType = (value: ObjectType) => {
    this.selectedObjectType = value;
    this.objectRdfa = undefined;
  };

  save = (event: Event) => {
    event.preventDefault();
    if (this.canSave) {
      if (this.objectRdfa) {
        this.args.onSave({
          type: 'existing',
          predicate: this.newPredicate,
          object: unwrap(this.objectRdfa),
        });
      } else {
        this.args.onSave({
          type: this.selectedObjectType,
          predicate: this.newPredicate,
          uriBase: this.resourceUriBase,
        });
      }
    }
  };

  get canSave() {
    if (!this.newPredicate) return false;
    switch (this.selectedObjectType) {
      case 'literal':
        return true;
      case 'resource':
        return this.objectRdfa || this.resourceUriBase;
      default:
        return false;
    }
  }
}
