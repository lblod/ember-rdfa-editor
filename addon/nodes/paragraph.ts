import { NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor';

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
  toDOM() {
    // console.log("writing", node.attrs);
    return ['p', 0];
  },
};
