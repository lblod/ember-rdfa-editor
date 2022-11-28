import {
  emberComponent,
  EmberInlineComponent,
} from '@lblod/ember-rdfa-editor/core/prosemirror';
import { NodeConfig } from '@lblod/ember-rdfa-editor/core/rdfa-editor-plugin';
import { hbs, TemplateFactory } from 'ember-cli-htmlbars';
import { Node as PNode, NodeSpec } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';

class DropdownView implements NodeView {
  dom: Element;
  emberComponent: EmberInlineComponent;
  template: TemplateFactory = hbs`
      <InlineComponentsPlugin::Dropdown @getPos={{this.getPos}}/>`;

  constructor(pNode: PNode, view: EditorView, getPos: () => number) {
    const { node, component } = emberComponent('dropdown', this.template, {
      getPos,
      node: pNode,
      updateAttribute: (attr, value) => {
        const transaction = view.state.tr;
        transaction.setNodeAttribute(getPos(), attr, value);
        view.dispatch(transaction);
      },
    });
    this.dom = node;
    this.emberComponent = component;
  }

  destroy() {
    this.emberComponent.destroy();
  }

  stopEvent() {
    return true;
  }
}

const dropdown: NodeSpec = {
  inline: true,
  atom: true,
  group: 'inline',
  selectable: true,
  parseDOM: [
    {
      tag: 'span',
      getAttrs(node: HTMLElement) {
        if (node.dataset.inlineComponent === 'dropdown') {
          return {};
        }
        return false;
      },
    },
  ],
  toDOM() {
    return ['span', { 'data-inline-component': 'dropdown' }];
  },
};

const dropdownConfig: NodeConfig = {
  name: 'dropdown',
  spec: dropdown,
  view: (node, view, getPos) => new DropdownView(node, view, getPos),
};

export default dropdownConfig;
