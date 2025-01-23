import { PNode, ResolvedPos } from '@lblod/ember-rdfa-editor';

export function getGroups(node: PNode) {
  return node.type.spec.group?.split(' ') ?? [];
}

export function hasGroups(node: PNode, ...groups: string[]) {
  const nodeGroups = getGroups(node);
  return groups.every((group) => nodeGroups.includes(group));
}

export function isResourceNode(node: PNode) {
  return node.attrs['rdfaNodeType'] === 'resource';
}

export function supportsAttribute(node: PNode, attribute: string) {
  return !!node.type.spec.attrs?.[attribute];
}

export function getParent(node: PNode, doc: PNode) {
  const pos = getPos(node, doc);
  if (!pos) {
    return;
  }
  if (pos === -1) {
    console.warn(`getParent: ${node.toString()} has no parent`);
    return;
  }
  return pos.parent;
}

export function getPos(node: PNode, doc: PNode): ResolvedPos | -1 | undefined {
  if (node === doc) {
    return -1;
  }
  let result: ResolvedPos | undefined;
  doc.descendants((descendant, pos) => {
    if (node === descendant) {
      result = doc.resolve(pos);
    }
    return !result;
  });
  if (!result) {
    console.warn(`getPos: ${node.toString()} not found in ${doc.toString()}`);
  }
  return result;
}
