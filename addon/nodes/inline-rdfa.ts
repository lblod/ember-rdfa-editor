import { Node as PNode, NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor';

export const inline_rdfa: NodeSpec = {
  inline: true,
  content: 'inline*',
  draggable: true,
  defining: true,
  group: 'inline',
  attrs: {
    ...rdfaAttrs,
    __tag: { default: 'span' },
  },
  parseDOM: [
    {
      tag: 'span, link',
      getAttrs(node: HTMLElement) {
        const attrs = getRdfaAttrs(node);
        if (attrs) {
          return attrs;
        }
        return false;
      },
    },
  ],
  toDOM(node: PNode) {
    return [node.attrs.__tag, node.attrs, 0];
  },
};
