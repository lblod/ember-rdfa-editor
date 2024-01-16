import { PNode } from '@lblod/ember-rdfa-editor';

export function getGroups(node: PNode) {
  return node.type.spec.group?.split(' ') ?? [];
}

export function hasGroups(node: PNode, ...groups: string[]) {
  const nodeGroups = getGroups(node);
  return groups.every((group) => nodeGroups.includes(group));
}
