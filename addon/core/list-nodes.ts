import { Node as PNode, NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';

export const ordered_list: NodeSpec = {
  attrs: { order: { default: 1 }, ...rdfaAttrs },
  content: 'list_item+',
  group: 'block',
  parseDOM: [
    {
      tag: 'ol',
      getAttrs(dom: HTMLElement) {
        return {
          order: dom.hasAttribute('start') ? +dom.getAttribute('start')! : 1,
          ...getRdfaAttrs(dom),
        };
      },
    },
  ],
  toDOM(node) {
    return node.attrs.order == 1
      ? ['ol', { ...node.attrs }, 0]
      : ['ol', { start: node.attrs.order, ...node.attrs }, 0];
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
