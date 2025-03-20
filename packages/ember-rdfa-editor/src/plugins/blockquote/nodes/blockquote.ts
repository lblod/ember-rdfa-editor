import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node.ts';
import { type NodeSpec } from 'prosemirror-model';

export const blockquote: NodeSpec = {
  content: 'block+',
  group: 'block',
  classNames: ['say-blockquote'],
  defining: true,
  parseDOM: [{ tag: 'blockquote' }],
  toDOM(node) {
    return ['blockquote', { class: getClassnamesFromNode(node) }, 0];
  },
};
