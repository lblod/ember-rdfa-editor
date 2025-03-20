import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node.ts';
import type { NodeSpec } from 'prosemirror-model';

export const code_block: NodeSpec = {
  content: 'inline*',
  marks: '',
  group: 'block',
  code: true,
  defining: true,
  classNames: ['say-code-block'],
  parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
  toDOM(node) {
    return ['pre', { class: getClassnamesFromNode(node) }, ['code', 0]];
  },
};
