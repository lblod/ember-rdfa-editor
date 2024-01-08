import { MarkSpec } from 'prosemirror-model';

const isValidCssColor = (colorString: string) =>
  CSS.supports('color', colorString);

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
    {
      style: 'background',
      getAttrs(value) {
        if (typeof value !== 'string') return false;

        if (!isValidCssColor(value.trim())) return false;

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
