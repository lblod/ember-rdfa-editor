declare module '@lblod/marawa/dom-helpers' {
  export function findFirstNodeOfType(node: Node, type: string): Node | null;
  export function findAllNodesOfType(node: Node, type: string): Node[];
}
