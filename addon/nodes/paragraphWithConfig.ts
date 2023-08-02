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

interface paragraphConfig {
  content?: string;
  marks?: string;
  group?: string;
  /* A name to separate different kinds of paragraphs in toDom functions.
  Mandatory for anything that isn't a basic paragraph.*/
  name?: string;
}

export const paragraphWithConfig: (config?: paragraphConfig) => NodeSpec = (
  config,
) => {
  return {
    name: config?.name || 'paragraphWithConfig',
    content: config?.content || 'inline*',
    group: config?.group || 'block paragraphGroup',
    attrs: {
      indentationLevel: {
        default: 0,
      },
      paragraphType: {
        default: config?.name || '',
      },
    },
    parseDOM: [
      {
        tag: 'p',
        getAttrs(node: HTMLElement) {
          const nonBlockNode = node.querySelector(BLOCK_SELECTOR);
          const matchingType =
            !node.dataset.paragraphType ||
            node.dataset.paragraphType === config?.name;
          if (nonBlockNode && matchingType) {
            return {
              indentationLevel: optionMapOr(
                0,
                parseInt,
                node.dataset.indentationLevel,
              ),
              paragraphType: node.dataset.paragraphType || '',
            };
          }
          return false;
        },
        skip: true,
      },
      {
        tag: 'p',
        getAttrs(node: HTMLElement) {
          console.log('2, ', node.dataset.paragraphType);
          const myAttrs = getRdfaAttrs(node);
          if (myAttrs) {
            return false;
          }
          const matchingType =
            !node.dataset.paragraphType ||
            node.dataset.paragraphType === config?.name;
          if (!matchingType) return false;

          return {
            indentationLevel: optionMapOr(
              0,
              parseInt,
              node.dataset.indentationLevel,
            ),
            paragraphType: node.dataset.paragraphType || '',
          };
        },
        consuming: false,
      },
    ],
    toDOM(node) {
      const attrs = {};
      attrs['data-indentation-level'] = node.attrs.indentationLevel as number;
      if (node.attrs.paragraphType && node.attrs.paragraphType !== '') {
        attrs['data-paragraph-type'] = node.attrs.paragraphType as string;
      }
      return ['p', attrs, 0];
    },
  };
};
