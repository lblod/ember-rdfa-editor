import { NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs } from '@lblod/ember-rdfa-editor';

export const paragraph: NodeSpec = {
  content: 'inline*',
  group: 'block',
  // defining: true,
  consuming: false,
  parseDOM: [
    {
      tag: 'p',
      getAttrs(node: HTMLElement) {
        const myAttrs = getRdfaAttrs(node);
        if (myAttrs) {
          return false;
        }
        return null;
      },
    },
  ],
  toDOM() {
    return ['p', {}, 0];
  },
};
