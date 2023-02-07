import { NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs } from '@lblod/ember-rdfa-editor';
import { NON_BLOCK_NODES } from '@lblod/ember-rdfa-editor/utils/constants';

let BLOCK_SELECTOR = '';
NON_BLOCK_NODES.forEach(
  (tag) => (BLOCK_SELECTOR = `${BLOCK_SELECTOR}${tag}, `)
);
BLOCK_SELECTOR = BLOCK_SELECTOR.substring(0, BLOCK_SELECTOR.length - 2);
export const paragraph: NodeSpec = {
  content: 'inline*',
  group: 'block',
  // defining: true,
  parseDOM: [
    {
      tag: 'p',
      getAttrs(node: HTMLElement) {
        const nonBlockNode = node.querySelector(BLOCK_SELECTOR);
        if (nonBlockNode) {
          return null;
        }
        return false;
      },
      skip: true,
    },
    {
      tag: 'p',
      getAttrs(node: HTMLElement) {
        const myAttrs = getRdfaAttrs(node);
        if (myAttrs) {
          return false;
        }
        return null;
      },
      consuming: false,
    },
  ],
  toDOM() {
    return ['p', {}, 0];
  },
};
