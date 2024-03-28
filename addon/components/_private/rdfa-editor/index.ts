import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import RdfaPropertyEditor from './property-editor';
import RdfaRelationshipEditor from './relationship-editor';
import RdfaWrappingUtils from './wrapping-utils';
import RemoveNode from './remove-node';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const ChevronDownIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/chevron-down')
      .ChevronDownIcon
  : 'chevron-down';
const ChevronUpIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/chevron-up')
      .ChevronUpIcon
  : 'chevron-up';

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
};
export default class RdfaEditor extends Component<Args> {
  PropertyEditor = RdfaPropertyEditor;
  RelationshipEditor = RdfaRelationshipEditor;
  WrappingUtils = RdfaWrappingUtils;
  // Disable the rdfa-type convertor for now
  // RdfaTypeConvertor = RdfaTypeConvertor;
  RemoveNode = RemoveNode;
  ChevronDownIcon = ChevronDownIcon;
  ChevronUpIcon = ChevronUpIcon;

  @tracked collapsed = false;

  toggleSection = () => {
    this.collapsed = !this.collapsed;
  };

  get isResourceNode() {
    return isResourceNode(this.args.node.value);
  }

  get type() {
    return this.isResourceNode ? 'resource' : 'literal';
  }

  get controller() {
    return this.args.controller;
  }

  get showPropertiesSection() {
    return this.isResourceNode;
  }

  get hasSelection() {
    const selection = this.controller?.activeEditorState.selection;
    return selection && !selection.empty;
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
        if (node.attrs['__rdfaId'] === id) {
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
