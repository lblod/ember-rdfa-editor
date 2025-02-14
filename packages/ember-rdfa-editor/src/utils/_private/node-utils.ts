import { NodeSelection } from 'prosemirror-state';
import type { EditorState } from 'prosemirror-state';
import type { ResolvedPos } from 'prosemirror-model';
import type { PNode } from '#root/prosemirror-aliases.ts';

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

/**
 * Based on prosemirror-commands 'selectParentNode' but is not a command
 */
export function parentNodeSelection({
  doc,
  selection,
}: Pick<EditorState, 'doc' | 'selection'>): NodeSelection | null {
  const { $from, to } = selection;
  const sharedDepth = $from.sharedDepth(to);
  if (sharedDepth === 0) {
    // we're at the doc
    return null;
  }
  const pos = $from.before(sharedDepth);
  return NodeSelection.create(doc, pos);
}
