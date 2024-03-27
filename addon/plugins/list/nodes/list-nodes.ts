import type { Node as PNode } from 'prosemirror-model';
import {
  getRdfaAttrs,
  renderRdfaAware,
  getRdfaContentElement,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor/core/schema';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';
import type SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';

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
          return { ...getRdfaAttrs(node, { rdfaAware }) };
        },
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
function renderListMarker(style: string, path: number[]): string {
  const length = path.length;
  const lastIndex = length - 1;
  if (style === 'decimal') {
    return `${path[lastIndex] + 1}. `;
  } else if (style === 'lower-alpha') {
    return `${alphabet[path[lastIndex] % 26]}. `;
  } else if (style === 'upper-roman') {
    return `${romanize(path[lastIndex] + 1)}. `
  } else {
    return `${path.map((index) => index + 1).join('.')} `;
  }
}
/**
 * @deprecated use `listItemWithConfig` instead
 */
export const list_item = listItemWithConfig();
