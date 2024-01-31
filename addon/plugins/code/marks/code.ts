import type { MarkSpec } from '@lblod/ember-rdfa-editor';

export const code: MarkSpec = {
  parseDOM: [{ tag: 'code' }],
  toDOM() {
    return ['code', 0];
  },
};
