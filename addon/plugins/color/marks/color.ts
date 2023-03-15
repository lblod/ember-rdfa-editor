import { Mark, MarkSpec } from 'prosemirror-model';

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
    const style = `color: ${color as string}`;
    return ['span', { style }, 0];
  },
};
