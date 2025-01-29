import { ResolvedPos } from 'prosemirror-model';
import { PNode } from '#root/prosemirror-aliases.ts';

/**
 * Find a position between nodes that passes a predicate test in document order.
 * Tries out all possible node spots to the *left* of the given position
 * in order of how nodes are displayed in the document.
 * returns the position of the first match of the predicate or undefined if none found.
 * Note that unlike `findnodePosDown`, this is not optimized and might be slow for bigger documents.
 * @param mainDoc the main doc for which the position is returned
 * @param $startPos the starting ResolvedPos position to start the search from
 * @param predicate a predicate returning if the resolved position is valid.
 * @returns the global position (in reference to `mainDoc`)
 */
export function* findNodePosUp(
  mainDoc: PNode,
  startPos: number,
  predicate: ($pos: ResolvedPos) => boolean = () => true,
): Generator<number, void> {
  for (let pos = startPos - 1; pos >= 0; pos--) {
    const $pos = mainDoc.resolve(pos);
    // TextOffset = 0 means it is between nodes or inside a node with "empty" text content
    // isTextblock checks for this special case
    if ($pos.textOffset === 0 && !$pos.parent.isTextblock && predicate($pos)) {
      yield $pos.pos;
    }
  }
}

/**
 * Find a position between nodes that passes a predicate test in document order.
 * Tries out all possible node spots to the right of the given position
 * in order of how nodes are displayed in the document.
 * returns the position of the first match of the predicate or undefined if none found.
 * If you want to use the position (instead of just parent and index) to check if a node is valid,
 * loop over the return values of the generator instead.
 * @param mainDoc the main doc for which the position is returned
 * @param $startPos the starting ResolvedPos position to start the search from
 * @param predicate a predicate returning if the position is valid, receiving a parent and a local index.
 *                  `parent.child(index)` is then the child after the index place.

 * @returns the global position (in reference to `mainDoc`)
 */
export function* findNodePosDown(
  mainDoc: PNode,
  $startPos: ResolvedPos,
  predicate: (parent: PNode, index: number) => boolean = () => true,
): Generator<number, void> {
  // loop over the depths.
  // if at a depth no match is found, should check all children of a depth higher
  // *after* the passed $startPos
  for (let depth = $startPos.depth + 1; depth > 0; depth--) {
    const $pos = mainDoc.resolve($startPos.after(depth));
    const parent = $pos.parent;
    let index = $pos.index();

    // for this depth, check if the first place is valid (before checking inside the children)
    if ($pos.pos !== $startPos.pos && predicate(parent, index)) {
      yield $pos.pos;
    }

    // loop over the children *after* the given $startPos
    // and find a match in one of those children.
    // Note that checkContentMatchChildren returns offset starting from the
    // passed node, so an offset has to be kept for the final result.
    let offsetChildren = 0;
    while (index < parent.childCount) {
      const matchedChildOffsets = findNodePosChildrenAsOffset(
        parent,
        index,
        offsetChildren,
        predicate,
      );
      for (const matchedOffset of matchedChildOffsets) {
        yield $pos.pos + matchedOffset;
      }
      offsetChildren += parent.child(index).nodeSize;
      index++;
    }
    // check if can place here *after* the last node
    // offsetChildren is now the total offset in the parent, so shows the last pos in parent
    const lastPosInParent = $pos.pos + offsetChildren;
    // we don't return the original passed position
    if (
      lastPosInParent !== $startPos.pos &&
      predicate(parent, parent.childCount)
    ) {
      yield lastPosInParent;
    }
  }
}

/**
 * Try to find a predicate match in children (and further down) of the passed parent
 * starting from startIndex.
 * returns the offset from the start of the search where a match is found
 * a global position can be found by adding the returned offset to the passed start position
 * Checks in order of the "document", from left to right.
 * @param parent the parent node to check the childs for
 * @param startIndex the first index to check in the given parent (0 to check all children)
 * @param currentOffset the current offset which is used by the recursion. An initial value can be passed but this does not change anything for the algorithm.
 * @param predicate the predicate to check for positions between nodes
 * @returns the offset (starting from the parent's startIndex) to the position that was found
 */
export function* findNodePosChildrenAsOffset(
  parent: PNode,
  startIndex: number,
  currentOffset: number,
  predicate: (parent: PNode, index: number) => boolean,
): Generator<number, void> {
  // the node that this specific call refers to
  const node = parent.child(startIndex);
  // check the current index (="check before the child")
  const predicateValid = predicate(parent, startIndex);
  if (predicateValid) {
    if (currentOffset !== 0) {
      yield currentOffset;
    }
  }
  // when going inside children, we are moving one place to the right in pos,
  // e.g. if parent starts at "1", the first child will start at "2",
  // which means an extra offset needed
  currentOffset++;

  // going deeper in the tree is "closer" to the start position in regards to the document
  // than going to the next child
  let childOffset = 0;
  for (
    let nodeIndex = 0;
    nodeIndex < node.childCount;
    childOffset += node.child(nodeIndex).nodeSize, nodeIndex++
  ) {
    const childrenMatches = findNodePosChildrenAsOffset(
      node,
      nodeIndex,
      currentOffset + childOffset,
      predicate,
    );
    for (const childMatch of childrenMatches) {
      if (childMatch && childMatch !== 0) {
        yield childMatch;
      }
    }
  }

  // for next match, check behind the last child of the passed node
  // index starts at 0 and exists till after the last child
  // this means index0 child1 index1 child2 index2
  // So childCount gives the possible index (=the last possible index)
  // if our current index is one less than childCount,
  // we are just before the last child.
  // startIndex + 1 is just after the last child
  const beforeLastChild = node.childCount - 1;
  const afterLastChild = node.childCount;
  if (startIndex === beforeLastChild) {
    const predicateValid = predicate(node, afterLastChild);
    if (predicateValid) {
      const matchPlace = currentOffset + node.child(startIndex).nodeSize;
      // position after the next child
      yield matchPlace;
    }
  }
}
