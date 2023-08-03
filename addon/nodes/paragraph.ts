import { NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs } from '@lblod/ember-rdfa-editor';
import { NON_BLOCK_NODES } from '@lblod/ember-rdfa-editor/utils/_private/constants';
import { optionMapOr } from '../utils/_private/option';

let BLOCK_SELECTOR = '';
NON_BLOCK_NODES.forEach(
  (tag) => (BLOCK_SELECTOR = `${BLOCK_SELECTOR}${tag}, `),
);
BLOCK_SELECTOR = `:not(${BLOCK_SELECTOR.substring(
  0,
  BLOCK_SELECTOR.length - 2,
)})`;
export const paragraph: NodeSpec = {
  content: 'inline*',
  group: 'block',
  attrs: {
    indentationLevel: {
      default: 0,
    },
  },
  indentable: true,
  // defining: true,
  parseDOM: [
    {
      tag: 'p',
      getAttrs(node: HTMLElement) {
        const nonBlockNode = node.querySelector(BLOCK_SELECTOR);
        if (nonBlockNode) {
          return {
            indentationLevel: optionMapOr(
              0,
              parseInt,
              node.dataset.indentationLevel,
            ),
          };
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
        return {
          indentationLevel: optionMapOr(
            0,
            parseInt,
            node.dataset.indentationLevel,
          ),
        };
      },
      consuming: false,
    },
  ],
  toDOM(node) {
    return [
      'p',
      { 'data-indentation-level': node.attrs.indentationLevel as number },
      0,
    ];
  },
};
