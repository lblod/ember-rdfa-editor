import type { NodeSpec } from 'prosemirror-model';
import getClassnamesFromNode from '../utils/get-classnames-from-node.ts';

export const horizontal_rule: NodeSpec = {
  group: 'block',
  parseDOM: [{ tag: 'hr' }],
  classNames: ['say-horizontal-rule'],
  toDOM(node) {
    return ['hr', { class: getClassnamesFromNode(node) }];
  },
};
