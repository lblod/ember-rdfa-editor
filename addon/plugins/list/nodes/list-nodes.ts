import type { Node as PNode, NodeSpec } from 'prosemirror-model';
import {
  getRdfaAttrs,
  rdfaAttrSpec,
  renderRdfaAttrs,
  renderInvisibleRdfa,
  type RdfaAttrs,
} from '@lblod/ember-rdfa-editor/core/schema';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';

export type OrderListStyle = 'decimal' | 'upper-roman' | 'lower-alpha';

type OrderedListAttrs = typeof rdfaAttrSpec & {
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

export const ordered_list: NodeSpec = {
  attrs: { order: { default: 1 }, style: { default: null }, ...rdfaAttrSpec },
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
        return {
          order: optionMapOr(1, (val) => Number(val), start),
          style: getListStyleFromDomElement(dom),
          ...getRdfaAttrs(dom),
        };
      },
      consuming: false,
    },
  ],
  toDOM(node) {
    const { style, order, ...attrs } = node.attrs as OrderedListAttrs;

    return [
      'ol',
      {
        ...renderRdfaAttrs(node.attrs as RdfaAttrs),
        ...(order !== 1 && { start: order }),
        ...(style && {
          style: `list-style-type: ${style};`,
        }),
        ...attrs,
      },
      0,
    ];
  },
};
export const bullet_list: NodeSpec = {
  content: 'list_item+',
  group: 'block list',
  attrs: { ...rdfaAttrSpec },
  parseDOM: [
    {
      tag: 'ul',
      getAttrs(node: string | HTMLElement) {
        if (typeof node === 'string') {
          return false;
        }
        return {
          ...getRdfaAttrs(node),
        };
      },
      consuming: false,
    },
  ],
  toDOM(node: PNode) {
    return ['ul', { ...node.attrs }, 0];
  },
};

export const list_item: NodeSpec = {
  content: 'paragraphGroup+ block*',
  defining: true,
  attrs: { ...rdfaAttrSpec },
  parseDOM: [
    {
      tag: 'li',
    },
  ],
  toDOM(node: PNode) {
    return [
      'li',
      { ...renderRdfaAttrs(node.attrs as RdfaAttrs), ...node.attrs },
      renderInvisibleRdfa(node, 'div'),
      ['div', {}, 0],
    ];
  },
};
