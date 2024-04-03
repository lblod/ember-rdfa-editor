import type { Node as PNode, ParseRule } from 'prosemirror-model';
import {
  getRdfaAttrs,
  renderRdfaAware,
  getRdfaContentElement,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor/core/schema';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';
import type SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';
import type { Schema } from 'inspector';
import { tagName } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';

export type OrderListStyle = 'decimal' | 'upper-roman' | 'lower-alpha';

const getListStyleFromDomElement = (dom: HTMLElement) => {
  const { listStyleType } = dom.style;

  // Falling back to dataset for back-compatability
  return (listStyleType || dom.dataset['listStyle']) as
    | OrderListStyle
    | undefined;
};

type Config = {
  rdfaAware?: boolean;
};

export const orderedListWithConfig: (options?: Config) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    get attrs() {
      const baseAttrs = {
        order: { default: 1 },
        style: { default: null },
      };
      return {
        ...baseAttrs,
        ...rdfaAttrSpec({ rdfaAware }),
      };
    },
    content: 'list_item+',
    group: 'block list',
    parseDOM: [
      {
        tag: 'ol',
        getAttrs(dom: string | HTMLElement) {
          if (typeof dom === 'string') {
            return false;
          }
          const start = dom.getAttribute('start');
          const baseAttrs = {
            order: optionMapOr(1, (val) => Number(val), start),
            style: getListStyleFromDomElement(dom),
          };
          return {
            ...baseAttrs,
            ...getRdfaAttrs(dom, { rdfaAware }),
          };
        },
        consuming: false,
        contentElement: getRdfaContentElement,
      },
    ],
    toDOM(node) {
      const { style, order, ...attrs } = node.attrs;
      const baseAttrs = {
        ...(order !== 1 && { start: order }),
        ...(style && {
          style: `list-style-type: ${style};`,
        }),
      };
      if (rdfaAware) {
        return renderRdfaAware({
          renderable: node,
          tag: 'ol',
          attrs: baseAttrs,
          content: 0,
        });
      } else {
        return ['ol', { ...baseAttrs, ...attrs }, 0];
      }
    },
  };
};

/**
 * @deprecated use `orderedListWithConfig` instead
 */
export const ordered_list = orderedListWithConfig();

export const bulletListWithConfig: (options?: Config) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    content: 'list_item+',
    group: 'block list',
    attrs: { ...rdfaAttrSpec({ rdfaAware }), style: { default: 'unordered' } },
    parseDOM: [
      {
        tag: 'ul',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          return { ...getRdfaAttrs(node, { rdfaAware }) };
        },
        consuming: false,
        contentElement: getRdfaContentElement,
      },
    ],
    toDOM(node: PNode) {
      if (rdfaAware) {
        return renderRdfaAware({
          renderable: node,
          tag: 'ul',
          content: 0,
        });
      } else {
        return ['ul', node.attrs, 0];
      }
    },
  };
};

/**
 * @deprecated use `bulletListWithConfig` instead
 */
export const bullet_list = bulletListWithConfig();

export const listItemWithConfig: (options?: Config) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    content: 'paragraphGroup+ block*',
    defining: true,
    attrs: {
      ...rdfaAttrSpec({ rdfaAware }),
      listPath: { default: [] },
      listStyle: { default: 'unordered' },
    },
    parseDOM: [
      {
        tag: 'li',
        getAttrs(node: HTMLElement | string) {
          if (typeof node === 'string') {
            return false;
          }
          const mapping = getListItemMapping(this);
          const listPath = calculateListItemPath(node, mapping);
          console.log(mapping.get(node));
          let cur = node;
          let listStyle = cur.attributes.getNamedItem('listStyle')?.value ;
          while (!listStyle && cur.parentElement) {
            cur = cur.parentElement;
            listStyle = cur.attributes.getNamedItem('style')?.value;
          }
          return { ...getRdfaAttrs(node, { rdfaAware }), listPath, listStyle };
        },
        sayListItemMapping: new WeakMap<Node, number[]>(),
        contentElement: getRdfaContentElement,
      },
    ],
    toDOM(node: PNode) {
      if (rdfaAware) {
        return renderRdfaAware({
          renderable: node,
          tag: 'li',
          content: 0,
          attrs: {
            'data-list-marker': renderListMarker(
              node.attrs['listStyle'],
              node.attrs['listPath'],
            ),
          },
        });
      } else {
        return [
          'li',
          {
            ...node.attrs,
            'data-list-marker': renderListMarker(
              node.attrs['listStyle'],
              node.attrs['listPath'],
            ),
          },
          0,
        ];
      }
    },
  };
};
type ListItemMapping = WeakMap<Node, number[]>;
/**
 * a utility to conveniently get the list mapping out of a parseRule in a typesafe way
 */
function getListItemMapping(
  parseRule: ParseRule & { sayListItemMapping?: ListItemMapping },
): ListItemMapping {
  const mapping = parseRule.sayListItemMapping;
  if (mapping) {
    return mapping;
  } else {
    throw new Error('no list item mapping found on parserule');
  }
}

/**
 * Use dynamic programming to efficiently determine the hierarchy of a given <li> node
 */
function calculateListItemPath(node: Node, mapping: ListItemMapping): number[] {
  if (tagName(node) !== 'li') {
    throw new Error('Tried to calculate the list path of a non-li node');
  }
  const cached = mapping.get(node);
  if (cached) {
    return cached;
  }
  // first, get the path of the li higher up the tree, if there is one
  let basePath: number[] = [];
  const grandParent = node.parentNode?.parentNode;
  if (grandParent && tagName(grandParent) === 'li') {
    basePath = calculateListItemPath(grandParent, mapping);
  }

  // then we calculate our index relative to the previous li items at our level
  // we specifically skip all non-li siblings. Technically these should not exist, but
  // out-of-spec html is extremely common
  let prevSiblingLi = node.previousSibling;
  while (prevSiblingLi && tagName(prevSiblingLi) !== 'li') {
    prevSiblingLi = prevSiblingLi.previousSibling;
  }

  let index = 0;
  if (prevSiblingLi) {
    const prevSiblingPath = calculateListItemPath(prevSiblingLi, mapping);
    index = prevSiblingPath[prevSiblingPath.length - 1] + 1;
  }

  // the result is simply the path of our ancestor li concatenated with our index
  const resultPath = [...basePath, index];
  // and we store the result so we don't fibonnacci ourselves into exponential complexity
  mapping.set(node, resultPath);
  return resultPath;
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz';

function romanize(num: number) {
  const lookup = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = '';
  for (const [i, value] of Object.entries(lookup)) {
    while (num >= value) {
      roman += i;
      num -= value;
    }
  }
  return roman;
}
/**
 * Turns index into a base 26 number and maps it onto the alphabet, resulting
 * in "aa" for index 26, "ab" for 27, "ba" for 52, etc
 */
function indexToAlpha(index: number): string {
  let cur = index;
  let result = [];
  result.push(cur % 26);
  while (cur > 25) {
    // -1 here cause we're 0-based
    cur = Math.floor(cur / 26) - 1;
    result.push(cur % 26);
  }
  result.reverse();
  return result.map((index) => alphabet[index]).join('');
}
/**
 * Given a path and a style, render a human-readable representation which the css rule can
 * simply render without extra processing
 */
function renderListMarker(style: string, path: number[]): string {
  const length = path.length;
  const lastIndex = length - 1;
  if (style === 'decimal') {
    return `${path[lastIndex] + 1}. `;
  } else if (style === 'lower-alpha') {
    return `${indexToAlpha(path[lastIndex])}. `;
  } else if (style === 'upper-roman') {
    return `${romanize(path[lastIndex] + 1)}. `;
  } else {
    return `${path.map((index) => index + 1).join('.')}. `;
  }
}
/**
 * @deprecated use `listItemWithConfig` instead
 */
export const list_item = listItemWithConfig();
