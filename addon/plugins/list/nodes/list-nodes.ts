import { Node as PNode, NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';

export type OrderListStyle = 'decimal' | 'upper-roman' | 'lower-alpha';

type OrderedListAttrs = typeof rdfaAttrs & {
  order: number;
  style?: OrderListStyle;
};

export const ordered_list: NodeSpec = {
  attrs: { order: { default: 1 }, style: { default: null }, ...rdfaAttrs },
  content: 'list_item+',
  group: 'block list',
  parseDOM: [
    {
      tag: 'ol',
      getAttrs(dom: HTMLElement) {
        const start = dom.getAttribute('start');
        return {
          order: optionMapOr(1, (val) => Number(val), start),
          style: dom.dataset.listStyle,
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
  attrs: { ...rdfaAttrs },
  parseDOM: [
    {
      tag: 'ul',
      getAttrs(node: HTMLElement) {
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
  content: 'paragraph+ list*',
  defining: true,
  attrs: { ...rdfaAttrs },
  parseDOM: [
    {
      tag: 'li',
      getAttrs(node: HTMLElement) {
        return { ...getRdfaAttrs(node) };
      },
    },
  ],
  toDOM(node: PNode) {
    return ['li', { ...node.attrs }, 0];
  },
};
