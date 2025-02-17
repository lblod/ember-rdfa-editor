import type { PNode } from '#root/prosemirror-aliases.ts';
import type { Mark } from 'prosemirror-model';

export interface TextPNode {
  children: DatastoreResolvedPNode[];
  mark?: Mark;
  parent?: DatastoreResolvedPNode;
  domNode: Node;
  from: number;
  to: number;
}

export interface ElementPNode {
  node: PNode;
  from: number;
  to: number;
}
export type DatastoreResolvedPNode = ElementPNode | TextPNode;
export function isElementPNode(
  pnode: DatastoreResolvedPNode,
): pnode is ElementPNode {
  return 'node' in pnode;
}
