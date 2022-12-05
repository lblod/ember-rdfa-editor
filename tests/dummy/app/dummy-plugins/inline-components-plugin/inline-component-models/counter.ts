import {
  emberComponent,
  EmberInlineComponent,
} from '@lblod/ember-rdfa-editor/core/prosemirror';
import { hbs, TemplateFactory } from 'ember-cli-htmlbars';
import { Node as PNode, NodeSpec } from 'prosemirror-model';
import { EditorView, NodeView, NodeViewConstructor } from 'prosemirror-view';

class CounterView implements NodeView {
  node: PNode;
  dom: Element;
  emberComponent: EmberInlineComponent;
  template: TemplateFactory = hbs`<InlineComponentsPlugin::Counter @getPos={{this.getPos}} @node={{this.node}} @updateAttribute={{this.updateAttribute}}/>`;

  constructor(pNode: PNode, view: EditorView, getPos: () => number) {
    this.node = pNode;
    const { node, component } = emberComponent('counter', this.template, {
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

  update(node: PNode) {
    if (node.type !== this.node.type) return false;
    this.node = node;
    this.emberComponent.set('node', node);
    return true;
  }

  destroy() {
    this.emberComponent.destroy();
  }

  stopEvent() {
    return true;
  }
}

export const counter: NodeSpec = {
  inline: true,
  atom: true,
  group: 'inline',
  attrs: {
    count: { default: 0 },
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs(node: HTMLElement) {
        if (node.dataset.inlineComponent === 'counter') {
          return {
            count: parseInt(node.attributes.getNamedItem('count')!.value),
          };
        }
        return false;
      },
    },
  ],
  toDOM(node: PNode) {
    return ['span', { 'data-inline-component': 'counter', ...node.attrs }];
  },
};

export const counterView: NodeViewConstructor = (node, view, getPos) =>
  new CounterView(node, view, getPos);

