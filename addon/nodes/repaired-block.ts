import type { DOMOutputSpec, Node as PNode, NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';

export const repaired_block: NodeSpec = {
  inline: true,
  content: 'inline*',
  group: 'inline',
  attrs: { ...rdfaAttrSpec },
  // defining: true,
  parseDOM: [
    {
      tag: 'p, div, h1, h2, h3, h4, h5, h6, address, article, aside, blockquote, details, dialog, dd, dt, fieldset, figcaption, figure, footer, form, header, hgroup, hr, main, nav, pre, section',
      getAttrs(node: string | HTMLElement) {
        if (typeof node === 'string') {
          return false;
        }
        const myAttrs = getRdfaAttrs(node);
        if (myAttrs) {
          return myAttrs;
        }
        return null;
      },
      context: 'inline/',
    },
  ],
  toDOM(node: PNode): DOMOutputSpec {
    return ['span', { ...node.attrs }, 0];
  },
};
