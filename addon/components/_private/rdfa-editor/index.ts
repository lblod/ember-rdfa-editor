import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  IncomingProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';
import { ResolvedNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import RdfaPropertyEditor from './property-editor';
import RdfaRelationshipEditor from './relationship-editor';

type Args = {
  controller?: SayController;
  node: ResolvedNode;
};
export default class RdfaEditor extends Component<Args> {
  PropertyEditor = RdfaPropertyEditor;
  RelationshipEditor = RdfaRelationshipEditor;
  @tracked collapsed = false;

  toggleSection = () => {
    this.collapsed = !this.collapsed;
  };

  get type() {
    return isResourceNode(this.args.node.value) ? 'resource' : 'content';
  }

  get attributeProperties() {
    const properties = this.args.node.value.attrs.properties as
      | OutgoingProp[]
      | undefined;
    return properties?.filter((prop) => prop.type === 'attr');
  }

  get outgoing() {
    const properties = this.args.node.value.attrs.properties as
      | OutgoingProp[]
      | undefined;
    return properties?.filter((prop) => prop.type === 'node');
  }

  get backlinks() {
    return this.args.node.value.attrs.backlinks as IncomingProp[] | undefined;
  }

  get controller() {
    return this.args.controller;
  }

  get showPropertiesSection() {
    return this.type === 'resource';
  }

  get showOutgoingSection() {
    return this.type === 'resource';
  }

  goToNodeWithId = (id: string) => {
    if (this.controller) {
      const doc = this.controller.mainEditorState.doc;
      let found = false;
      let resultPos = 0;
      doc.descendants((node, pos) => {
        if (found) return false;
        if (node.attrs.__rdfaId === id) {
          found = true;
          resultPos = pos;
          return false;
        }
        return true;
      });
      if (found) {
        this.controller.withTransaction((tr) => {
          return tr
            .setSelection(new NodeSelection(tr.doc.resolve(resultPos)))
            .scrollIntoView();
        });
      }
    }
  };
}
