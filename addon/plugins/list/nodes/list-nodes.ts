import { Node as PNode, NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';

export type OrderListStyle = 'decimal' | 'upper-roman' | 'lower-alpha';

type OrderedListAttrs = typeof rdfaAttrs & {
  order: number;
  style?: OrderListStyle;
};

const getListStyleFromDomElement = (dom: HTMLElement) => {
  const { listStyleType } = dom.style;

  // Falling back to dataset for back-compatability
  return (listStyleType || dom.dataset.listStyle) as OrderListStyle | undefined;
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
  content: 'paragraphGroup+ block*',
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
