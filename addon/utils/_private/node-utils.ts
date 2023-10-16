import { PNode } from '@lblod/ember-rdfa-editor';

export function getGroups(node: PNode) {
  return node.type.spec.group?.split(' ') ?? [];
}

export function hasGroups(node: PNode, ...groups: string[]) {
  const nodeGroups = getGroups(node);
  return groups.every((group) => nodeGroups.includes(group));
}

export function isResourceNode(node: PNode) {
  return !!node.attrs.resource;
}

export function supportsAttribute(node: PNode, attribute: string) {
  return !!node.type.spec.attrs?.[attribute];
}
