import { Node as PNode, NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/option';

type OrderedListAttrs = typeof rdfaAttrs & {
  order: number;
  style: string;
};
export const ordered_list: NodeSpec = {
  attrs: { order: { default: 1 }, style: { default: 'decimal' }, ...rdfaAttrs },
  content: 'list_item+',
  group: 'block',
  parseDOM: [
    {
      tag: 'ol',
      getAttrs(dom: HTMLElement) {
        const start = dom.getAttribute('start');
        return {
          order: optionMapOr(1, (val) => Number(val), start),
          style: dom.dataset.listStyle || 'decimal',
          ...getRdfaAttrs(dom),
        };
      },
      consuming: false,
    },
  ],
  toDOM(node) {
    const { style, ...attrs } = node.attrs as OrderedListAttrs;
    console.log('STYLE: ', style);
    return attrs.order == 1
      ? ['ol', { ...attrs, 'data-list-style': style }, 0]
      : ['ol', { start: attrs.order, 'data-list-style': style, ...attrs }, 0];
  },
};
export const bullet_list: NodeSpec = {
  content: 'list_item+',
  group: 'block',
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
  content: 'paragraph block*',
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
