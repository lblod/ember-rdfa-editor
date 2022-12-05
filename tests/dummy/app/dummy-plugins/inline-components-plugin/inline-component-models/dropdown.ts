import { hbs, TemplateFactory } from 'ember-cli-htmlbars';
import {
  EditorView,
  emberComponent,
  EmberInlineComponent,
  NodeSpec,
  NodeView,
  NodeViewConstructor,
  PNode,
} from '@lblod/ember-rdfa-editor';

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

export const dropdown: NodeSpec = {
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

export const dropdownView: NodeViewConstructor = (node, view, getPos) =>
  new DropdownView(node, view, getPos);
