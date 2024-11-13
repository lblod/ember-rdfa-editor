import type { NodeSpec } from 'prosemirror-model';

export const hard_break: NodeSpec = {
  inline: true,
  group: 'inline',
  selectable: false,
  classNames: ['say-hard-break'],
  parseDOM: [{ tag: 'br' }],
  toDOM(node) {
    return ['br', { class: node.type.spec['classNames']?.join(' ') }];
  },
};
