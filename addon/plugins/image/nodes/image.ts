import type { ComponentLike } from '@glint/template';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  type EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import Image from '@lblod/ember-rdfa-editor/components/plugins/image/node';
import { Node as PNode } from 'prosemirror-model';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';

const emberNodeConfig = ({
  allowBase64Images,
}: {
  allowBase64Images?: boolean;
}): EmberNodeConfig => ({
  name: 'image',
  component: Image as unknown as ComponentLike,
  inline: true,
  group: 'inline',
  draggable: true,
  atom: true,
  classNames: ['say-image'],
  attrs: {
    src: {},
    alt: { default: null },
    width: { default: null },
    height: { default: null },
  },
  parseDOM: [
    {
      tag: allowBase64Images ? 'img[src]' : 'img[src]:not([src^="data:"])',
      getAttrs(dom: string | HTMLElement) {
        if (typeof dom === 'string') {
          return false;
        }
        return {
          src: dom.getAttribute('src'),
          alt: dom.getAttribute('alt'),
          width: dom.dataset['width'] ? Number(dom.dataset['width']) : null,
          height: dom.dataset['height'] ? Number(dom.dataset['height']) : null,
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
        class: getClassnamesFromNode(node),
      },
    ];
  },
  stopEvent() {
    return false;
  },
});

export const image = createEmberNodeSpec(
  emberNodeConfig({ allowBase64Images: false }),
);
export const imageWithConfig = ({
  allowBase64Images,
}: {
  allowBase64Images: boolean;
}) => createEmberNodeSpec(emberNodeConfig({ allowBase64Images }));
export const imageView = createEmberNodeView(emberNodeConfig({}));
