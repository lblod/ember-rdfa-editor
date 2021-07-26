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
export default function flatMap<T extends Node | RichNode>(startNode: T, predicate: (node: T) => boolean, stopOnFirstMatch = false): Array<T> {
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

  return matches as T[];
}

function getChildren<T extends RichNode | Node>(node: T): Iterable<T> {
  if (node instanceof Node) {
    return node.childNodes as Iterable<T>;
  }

  return node.children as Iterable<T>;
}
