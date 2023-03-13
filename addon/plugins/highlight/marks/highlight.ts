import { MarkSpec } from 'prosemirror-model';

export const highlight: MarkSpec = {
  attrs: {
    value: {},
  },
  parseDOM: [
    {
      style: 'background-color',
      getAttrs(value) {
        return {
          value,
        };
      },
    },
  ],
  toDOM(node) {
    const { value } = node.attrs;
    return ['span', { style: `background-color: ${value as string}` }, 0];
  },
};
