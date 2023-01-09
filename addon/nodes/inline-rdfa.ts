import {
  getRdfaAttrs,
  NodeSpec,
  PNode,
  rdfaAttrs,
} from '@lblod/ember-rdfa-editor';

export const inline_rdfa: NodeSpec = {
  attrs: {
    ...rdfaAttrs,
    __tag: { default: 'span' },
  },
  content: 'inline*',
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      tag: 'span, link',
      getAttrs(node: HTMLElement) {
        return getRdfaAttrs(node);
      },
    },
  ],
  toDOM(node: PNode) {
    return [node.attrs.__tag, node.attrs, 0];
  },
};
