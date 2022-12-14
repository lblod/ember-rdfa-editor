import { Node as PNode, ResolvedPos } from 'prosemirror-model';

export function findAncestors(
  pos: ResolvedPos,
  predicate: (node: PNode) => boolean = () => true
) {
  const result: { node: PNode; pos: number }[] = [];
  let depth = pos.depth;
  while (depth >= 0) {
    const parent = pos.node(depth);
    if (predicate(parent)) {
      result.push({ node: parent, pos: pos.before(depth) });
    }
    depth -= 1;
  }
  return result;
}

export function* children(
  resolvedNode: { node: PNode; pos: number },
  reverse = true,
  recursive = true,
  filter: ({ node, pos }: { node: PNode; pos: number }) => boolean = () => true,
  startIndex = reverse ? resolvedNode.node.childCount - 1 : 0
): Generator<{ node: PNode; pos: number }, void> {
  const { node, pos } = resolvedNode;
  if (reverse) {
    let offset = node.content.size;
    for (let i = startIndex; i >= 0; i--) {
      offset -= node.child(i).nodeSize;
      const resolvedChild = { node: node.child(i), pos: pos + 1 + offset };
      if (recursive) {
        yield* children(resolvedChild, reverse, recursive, filter);
      }
      if (filter(resolvedChild)) {
        yield resolvedChild;
      }
    }
  } else {
    let offset = 0;
    for (let i = 0; i < node.childCount; i++) {
      if (i >= startIndex) {
        const resolvedChild = { node: node.child(i), pos: pos + 1 + offset };
        if (filter(resolvedChild)) {
          yield { node: node.child(i), pos: pos + 1 + offset };
        }
        if (recursive) {
          yield* children(resolvedChild, reverse, recursive, filter);
        }
      }
      offset += node.child(i).nodeSize;
    }
  }
}

export function* nodesBetween(
  from: ResolvedPos,
  visitParentUpwards = false,
  reverse = false,
  filter: ({ node, pos }: { node: PNode; pos: number }) => boolean = () => true
): Generator<{ node: PNode; pos: number }, undefined> {
  let startIndex: number;
  const index = from.index();
  const indexAfter = from.indexAfter();
  if (reverse) {
    startIndex = index === indexAfter ? index - 1 : index;
  } else {
    startIndex = index;
  }
  const resolvedParent = {
    node: from.parent,
    pos: from.depth > 0 ? from.before() : -1,
  };
  yield* children(resolvedParent, reverse, true, filter, startIndex);
  if (visitParentUpwards && from.depth !== 0) {
    yield resolvedParent;
    const resolvedPos = from.doc.resolve(
      reverse ? from.before() : from.after()
    );
    yield* nodesBetween(resolvedPos, visitParentUpwards, reverse, filter);
  }
  return;
}
