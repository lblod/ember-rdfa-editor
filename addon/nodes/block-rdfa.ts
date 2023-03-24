import { Node as PNode, NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor';

export const block_rdfa: NodeSpec = {
  content: 'block+',
  group: 'block',
  attrs: {
    ...rdfaAttrs,
    __tag: { default: 'div' },
  },
  defining: true,
  isolating: true,
  selectable: true,
  parseDOM: [
    {
      tag: `p, div, address, article, aside, blockquote, details, dialog, dd, dt, fieldset, figcaption, figure, footer, form, header, hgroup, hr, main, nav, pre, section`,
      getAttrs(node: HTMLElement) {
        return getRdfaAttrs(node);
      },
    },
  ],
  toDOM(node: PNode) {
    return [node.attrs.__tag, node.attrs, 0];
  },
};
