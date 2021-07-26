import RichNode from "@lblod/marawa/rich-node";

/**
 * Takes a tree and returns a list of nodes that match the given predicate.
 *
 * @method flatMap
 *
 * @param {Node | RichNode} startNode
 * @param {Function} predicate
 * @param {Boolean} stopOnFirstMatch
 *
 * @return {RichNode[]} list of nodes matching the predicate function
 */
export default function flatMap(startNode: Node, predicate: (node: Node) => boolean, stopOnFirstMatch: boolean): Node[];
export default function flatMap(startNode: RichNode, predicate: (node: RichNode) => boolean, stopOnFirstMatch: boolean): RichNode[];
export default function flatMap<T extends Node | RichNode>(startNode: T, predicate: (node: T) => boolean, stopOnFirstMatch = false): T[] {
  const matches = [];

  let currentScan;
  let nextScan = [startNode];

  while (nextScan.length) {
    currentScan = nextScan;
    nextScan = [];

    for (const node of currentScan) {
      if (predicate(node)) {
        if (stopOnFirstMatch) {
          return [node];
        } else {
          matches.push(node);
        }
      }

      const children = getChildren(node);
      if (children) {
        nextScan.push(...children);
      }
    }
  }

  return matches;
}

function getChildren(node: Node): Iterable<Node>;
function getChildren(node: RichNode): RichNode[];
function getChildren(node: Node | RichNode): Iterable<Node> | RichNode[] {
  if (node instanceof Node) {
    return node.childNodes;
  }

  return node.children;
}
