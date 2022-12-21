import { NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, PNode, rdfaAttrs } from '@lblod/ember-rdfa-editor';

export const paragraph: NodeSpec = {
  content: 'inline*',
  group: 'block',
  attrs: { ...rdfaAttrs },
  // defining: true,
  parseDOM: [
    {
      tag: 'p',
      getAttrs(node: HTMLElement) {
        const myAttrs = getRdfaAttrs(node);
        if (myAttrs) {
          return myAttrs;
        }
        return null;
      },
      context: 'block/',
    },
  ],
  toDOM(node: PNode) {
    return ['p', node.attrs, 0];
  },
};
