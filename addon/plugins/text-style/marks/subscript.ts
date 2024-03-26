import type { MarkSpec } from 'prosemirror-model';

export const subscript: MarkSpec = {
  excludes: 'subscript superscript',
  parseDOM: [{ tag: 'sub' }],
  toDOM() {
    return ['sub', 0];
  },
};
