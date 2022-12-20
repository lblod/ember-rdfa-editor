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
        // console.log('parsing', node);
        const myAttrs = getRdfaAttrs(node);
        if (myAttrs) {
          console.log(myAttrs);
          return myAttrs;
        }
        return null;
      },
      context: 'block/',
    },
  ],
  toDOM(node: PNode) {
    // console.log("writing", node.attrs);
    return ['p', node.attrs, 0];
  },
};
