import type { MarkSpec } from 'prosemirror-model';

export const superscript: MarkSpec = {
  excludes: 'superscript subscript',
  parseDOM: [{ tag: 'sup' }],
  toDOM() {
    return ['sup', 0];
  },
};
