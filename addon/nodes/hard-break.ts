import type { NodeSpec } from 'prosemirror-model';
import getClassnamesFromNode from '../utils/get-classnames-from-node';

export const hard_break: NodeSpec = {
  inline: true,
  group: 'inline',
  selectable: false,
  classNames: ['say-hard-break'],
  parseDOM: [{ tag: 'br' }],
  toDOM(node) {
    return ['br', { class: getClassnamesFromNode(node) }];
  },
};
