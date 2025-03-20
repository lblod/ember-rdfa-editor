import type { PNode } from '@lblod/ember-rdfa-editor/prosemirror-aliases.ts';

type ClassNameProp = ((node: PNode) => string) | string[];
export default function getClassnamesFromNode(node: PNode) {
  const classNames = node.type.spec['classNames'] as ClassNameProp;
  if (Array.isArray(classNames)) {
    return classNames.join(' ');
  } else if (typeof classNames === 'function') {
    return classNames(node);
  }
  return '';
}
