import type { Mark, MarkSpec } from 'prosemirror-model';

export const color: MarkSpec = {
  attrs: {
    color: {},
  },
  parseDOM: [
    {
      style: 'color',
      getAttrs: (value) => {
        return {
          color: value,
        };
      },
    },
  ],
  toDOM(mark: Mark) {
    const { color } = mark.attrs;

    return [
      'span',
      { style: `color: ${color as string}`, 'data-mark': 'color' },
      0,
    ];
  },
};
