import type { NodeSpec } from 'prosemirror-model';
import { PLACEHOLDER_CLASS } from '../../../utils/_private/constants';

export const placeholder: NodeSpec = {
  attrs: { placeholderText: { default: 'placeholder' } },
  inline: true,
  group: 'inline',
  selectable: true,
  draggable: false,
  atom: true,
  defining: false,
  classNames: ['say-placeholder'],
  toDOM(node) {
    return [
      'span',
      {
        class: `${PLACEHOLDER_CLASS} ${getClassnamesFromNode(node)}`,
        ...node.attrs,
        contenteditable: false,
      },
      node.attrs['placeholderText'],
    ];
  },
  leafText(node) {
    return node.attrs['placeholderText'] as string;
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs(node: string | HTMLElement) {
        if (typeof node === 'string') {
          return false;
        }
        if (node.classList.contains(PLACEHOLDER_CLASS)) {
          return { placeholderText: node.innerText };
        }
        return false;
      },
    },
  ],
};
