import { NodeSpec } from 'prosemirror-model';
import { rdfaAttrs } from '../core/schema';
import { PLACEHOLDER_CLASS } from '../utils/constants';

export const placeholder: NodeSpec = {
  attrs: { ...rdfaAttrs, placeholderText: { default: 'placeholder' } },
  inline: true,
  group: 'inline',
  selectable: true,
  defining: false,
  toDOM(node) {
    return [
      'span',
      { class: PLACEHOLDER_CLASS, ...node.attrs, contenteditable: false },
      node.attrs.placeholderText,
    ];
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs(node: HTMLElement) {
        if (node.classList.contains(PLACEHOLDER_CLASS)) {
          return { placeholderText: node.innerText };
        }
        return false;
      },
    },
  ],
};
