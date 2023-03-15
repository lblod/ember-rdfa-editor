import { Node as PNode, NodeSpec } from 'prosemirror-model';

export const image: NodeSpec = {
  inline: true,
  attrs: {
    src: {},
    alt: { default: null },
    title: { default: null },
  },
  group: 'inline',
  draggable: true,
  parseDOM: [
    {
      tag: 'img[src]:not([src^="data:"])',
      getAttrs(dom: HTMLElement) {
        return {
          src: dom.getAttribute('src'),
          title: dom.getAttribute('title'),
          alt: dom.getAttribute('alt'),
        };
      },
    },
  ],
  toDOM(node: PNode) {
    return ['img', node.attrs];
  },
};
