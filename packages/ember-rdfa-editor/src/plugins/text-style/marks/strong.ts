import type { MarkSpec } from 'prosemirror-model';

export const strong: MarkSpec = {
  parseDOM: [
    { tag: 'strong' },
    // This works around a Google Docs misbehavior where
    // pasted content will be inexplicably wrapped in `<b>`
    // tags with a font-weight normal.
    {
      tag: 'b',
      getAttrs: (node: string | HTMLElement) => {
        if (typeof node === 'string') {
          return false;
        }
        return node.style.fontWeight != 'normal' && null;
      },
    },
    {
      style: 'font-weight',
      getAttrs: (value: string | HTMLElement) => {
        if (typeof value !== 'string') {
          return false;
        }

        return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null;
      },
    },
  ],
  toDOM() {
    return ['strong', 0];
  },
};
