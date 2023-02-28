import { NodeSpec } from 'prosemirror-model';

export const code_block: NodeSpec = {
  content: 'inline*',
  marks: '',
  group: 'block',
  code: true,
  defining: true,
  parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
  toDOM() {
    return ['pre', ['code', 0]];
  },
};
