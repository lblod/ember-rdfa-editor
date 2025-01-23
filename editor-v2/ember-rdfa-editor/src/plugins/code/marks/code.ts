import type { MarkSpec } from '#root';

export const code: MarkSpec = {
  parseDOM: [{ tag: 'code' }],
  toDOM() {
    return ['code', 0];
  },
};
