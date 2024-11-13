import { type NodeSpec } from 'prosemirror-model';

export const blockquote: NodeSpec = {
  content: 'block+',
  group: 'block',
  classNames: ['say-blockquote'],
  defining: true,
  parseDOM: [{ tag: 'blockquote' }],
  toDOM(node) {
    return [
      'blockquote',
      { class: node.type.spec['classNames']?.join(' ') },
      0,
    ];
  },
};
