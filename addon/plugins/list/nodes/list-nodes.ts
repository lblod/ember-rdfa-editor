import type { Node as PNode } from 'prosemirror-model';
import {
  getRdfaAttrs,
  rdfaAwareAttrSpec,
  renderRdfaAware,
  classicRdfaAttrSpec,
  getRdfaContentElement,
} from '@lblod/ember-rdfa-editor/core/schema';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';
import type SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';

export type OrderListStyle = 'decimal' | 'upper-roman' | 'lower-alpha';

type OrderedListAttrs = typeof rdfaAwareAttrSpec & {
  order: number;
  style?: OrderListStyle;
};

const getListStyleFromDomElement = (dom: HTMLElement) => {
  const { listStyleType } = dom.style;

  // Falling back to dataset for back-compatability
  return (listStyleType || dom.dataset['listStyle']) as
    | OrderListStyle
    | undefined;
};

type Options = {
  rdfaAware?: boolean;
};

export const ordered_list: (options?: Options) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    get attrs() {
      const baseAttrs = {
        order: { default: 1 },
        style: { default: null },
      };
      if (rdfaAware) {
        return {
          ...baseAttrs,
          ...rdfaAwareAttrSpec,
        };
      } else {
        return {
          ...baseAttrs,
          ...classicRdfaAttrSpec,
        };
      }
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
      const { style, order, ...attrs } = node.attrs as OrderedListAttrs;
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

export const bullet_list: (options?: Options) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    content: 'list_item+',
    group: 'block list',
    get attrs() {
      if (rdfaAware) {
        return rdfaAwareAttrSpec;
      } else {
        return classicRdfaAttrSpec;
      }
    },
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

export const list_item: (options?: Options) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    content: 'paragraphGroup+ block*',
    defining: true,
    get attrs() {
      if (rdfaAware) {
        return rdfaAwareAttrSpec;
      } else {
        return classicRdfaAttrSpec;
      }
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
        });
      } else {
        return ['li', node.attrs, 0];
      }
    },
  };
};
