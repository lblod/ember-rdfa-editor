import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import RdfaPropertyEditor from './property-editor';
import RdfaRelationshipEditor from './relationship-editor';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
};
export default class RdfaEditor extends Component<Args> {
  PropertyEditor = RdfaPropertyEditor;
  RelationshipEditor = RdfaRelationshipEditor;

  // Disable the rdfa-type convertor for now
  // RdfaTypeConvertor = RdfaTypeConvertor;

  @tracked collapsed = false;

  toggleSection = () => {
    this.collapsed = !this.collapsed;
  };

  get isResourceNode() {
    return isResourceNode(this.args.node.value);
  }

  get type() {
    return this.isResourceNode ? 'resource' : 'content';
  }

  get controller() {
    return this.args.controller;
  }

  get showPropertiesSection() {
    return this.isResourceNode;
  }

  // get supportsRdfaTypeConversion() {
  //   return !!this.args.node.value.type.spec.attrs?.['rdfaNodeType'];
  // }

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
