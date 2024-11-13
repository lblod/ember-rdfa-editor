import type { NodeSpec } from 'prosemirror-model';

export const horizontal_rule: NodeSpec = {
  group: 'block',
  parseDOM: [{ tag: 'hr' }],
  classNames: ['say-horizontal-rule'],
  toDOM(node) {
    return ['hr', { class: node.type.spec['classNames']?.join(' ') }];
  },
};
