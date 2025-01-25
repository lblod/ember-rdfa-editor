import type { MarkSpec } from "prosemirror-model";

export const code: MarkSpec = {
  parseDOM: [{ tag: 'code' }],
  toDOM() {
    return ['code', 0];
  },
};
