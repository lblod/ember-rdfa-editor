import type { MarkSpec } from 'prosemirror-model';

export const em: MarkSpec = {
  parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
  toDOM() {
    return ['em', 0];
  },
};
