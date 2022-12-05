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

class CardView implements NodeView {
  node: PNode;
  dom: Element;
  contentDOM: HTMLElement;
  emberComponent: EmberInlineComponent;
  template: TemplateFactory = hbs`<InlineComponentsPlugin::Card
                                    @getPos={{this.getPos}}
                                    @node={{this.node}}
                                    @updateAttribute={{this.updateAttribute}}>
                                    <EditorComponents::Slot @contentDOM={{this.contentDOM}}/>
                                  </InlineComponentsPlugin::Card>`;

  constructor(pNode: PNode, view: EditorView, getPos: () => number) {
    this.node = pNode;
    this.contentDOM = document.createElement('div');
    const { node, component } = emberComponent('card', this.template, {
      getPos,
      node: pNode,
      updateAttribute: (attr, value) => {
        const transaction = view.state.tr;
        transaction.setNodeAttribute(getPos(), attr, value);
        view.dispatch(transaction);
      },
      contentDOM: this.contentDOM,
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

export const card: NodeSpec = {
  content: 'inline*',
  inline: false,
  atom: false,
  group: 'block',
  parseDOM: [
    {
      tag: 'div',
      getAttrs(node: HTMLElement) {
        if (node.dataset.inlineComponent === 'card') {
          return {};
        }
        return false;
      },
      contentElement(node: HTMLElement) {
        return node.querySelector('[data-slot]')!;
      },
    },
  ],
  toDOM() {
    return [
      'div',
      { 'data-inline-component': 'card' },
      ['div', { 'data-slot': 'true' }, 0],
    ];
  },
};

export const cardView: NodeViewConstructor = (node, view, getPos) =>
  new CardView(node, view, getPos);
