import type { MarkSpec } from 'prosemirror-model';

export const underline: MarkSpec = {
  parseDOM: [{ tag: 'u' }],
  toDOM() {
    return ['u', 0];
  },
};
