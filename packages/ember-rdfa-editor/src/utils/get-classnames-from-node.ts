import type { PNode } from '#root/prosemirror-aliases.ts';

export default function getClassnamesFromNode(node: PNode) {
  const classNames = node.type.spec['classNames'];
  if (Array.isArray(classNames)) {
    return classNames.join(' ');
  } else if (typeof classNames === 'function') {
    return classNames(node);
  }
}
