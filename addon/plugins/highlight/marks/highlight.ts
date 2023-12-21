import { MarkSpec } from 'prosemirror-model';

/**
 * Checks if the background attribute is just a color.
 *
 * - Hexadecimal color
 * - RGB color
 * - RGBA color
 * - Named color
 */
const BACKGROUND_IS_SIMPLE_COLOR_REGEXP =
  /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)|(^rgba\((\d{1,3},\s*){3}[\d.]+\)$)|(^rgb\((\d{1,3},\s*){2}[\d.]+\)$)|(^[a-z]+$)/i;

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
        if (typeof value !== 'string') return null;

        const isColor = BACKGROUND_IS_SIMPLE_COLOR_REGEXP.test(value.trim());

        if (!isColor) return null;

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
