import type { MarkSpec } from 'prosemirror-model';

export const strikethrough: MarkSpec = {
  parseDOM: [{ tag: 's' }, { tag: 'del' }],
  toDOM() {
    return ['del', 0];
  },
};
