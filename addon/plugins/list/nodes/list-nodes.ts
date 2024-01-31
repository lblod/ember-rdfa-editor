import type { Node as PNode, NodeSpec } from 'prosemirror-model';
import {
  getRdfaAttrs,
  rdfaAttrSpec,
  renderRdfaAttrs,
  renderInvisibleRdfa,
} from '@lblod/ember-rdfa-editor/core/schema';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';

export type OrderListStyle = 'decimal' | 'upper-roman' | 'lower-alpha';

type OrderedListAttrs = typeof rdfaAttrSpec & {
  order: number;
  style?: OrderListStyle;
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
          style: dom.dataset['listStyle'],
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
        ...renderRdfaAttrs(node),
        ...(order !== 1 && { start: order }),
        ...(style && { 'data-list-style': style }),
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
      { ...renderRdfaAttrs(node), ...node.attrs },
      renderInvisibleRdfa(node, 'div'),
      ['div', {}, 0],
    ];
  },
};
