import type { PNode } from '../index.ts';

export default function getClassnamesFromNode(node: PNode) {
  const classNames = node.type.spec['classNames'];
  if (Array.isArray(classNames)) {
    return classNames.join(' ');
  } else if (typeof classNames === 'function') {
    return classNames(node);
  }
}
