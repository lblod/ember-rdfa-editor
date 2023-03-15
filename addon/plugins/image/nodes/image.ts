import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { Node as PNode } from 'prosemirror-model';

const emberNodeConfig: EmberNodeConfig = {
  name: 'image',
  componentPath: 'plugins/image/node',
  inline: true,
  group: 'inline',
  draggable: true,
  atom: true,
  attrs: {
    src: {},
    alt: { default: null },
    width: { default: null },
    height: { default: null },
  },
  parseDOM: [
    {
      tag: 'img[src]:not([src^="data:"])',
      getAttrs(dom: HTMLElement) {
        return {
          src: dom.getAttribute('src'),
          alt: dom.getAttribute('alt'),
          width: dom.dataset.width ? Number(dom.dataset.width) : null,
          height: dom.dataset.height ? Number(dom.dataset.height) : null,
        };
      },
    },
  ],
  toDOM(node: PNode) {
    const { src, alt, width, height } = node.attrs;
    const widthStyle = width ? `width: ${width as number}px;` : '';
    const heightStyle = height ? `height: ${height as number}px;` : '';
    return [
      'img',
      {
        src: src as string,
        alt: alt as string | undefined,
        'data-width': width as number,
        'data-height': height as number,
        style: widthStyle + heightStyle,
      },
    ];
  },
  stopEvent() {
    return false;
  },
};

export const image = createEmberNodeSpec(emberNodeConfig);
export const imageView = createEmberNodeView(emberNodeConfig);
