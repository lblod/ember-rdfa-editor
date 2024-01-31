import type { NodeSpec } from 'prosemirror-model';

export const horizontal_rule: NodeSpec = {
  group: 'block',
  parseDOM: [{ tag: 'hr' }],
  toDOM() {
    return ['hr'];
  },
};
