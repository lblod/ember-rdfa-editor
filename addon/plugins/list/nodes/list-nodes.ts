import { Node as PNode, NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';

type OrderedListAttrs = typeof rdfaAttrs & {
  order: number;
};
export const ordered_list: NodeSpec = {
  attrs: { order: { default: 1 }, ...rdfaAttrs },
  content: 'list_item+',
  group: 'block',
  parseDOM: [
    {
      tag: 'ol',
      getAttrs(dom: HTMLElement) {
        const start = dom.getAttribute('start');
        return {
          order: optionMapOr(1, (val) => Number(val), start),
          ...getRdfaAttrs(dom),
        };
      },
      consuming: false,
    },
  ],
  toDOM(node) {
    const attrs = node.attrs as OrderedListAttrs;

    return attrs.order == 1
      ? ['ol', attrs, 0]
      : ['ol', { start: attrs.order, ...attrs }, 0];
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