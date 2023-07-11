import { Node as PNode, ResolvedPos } from 'prosemirror-model';

export function findAncestors(
  pos: ResolvedPos,
  predicate: (node: PNode) => boolean = () => true,
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

function* findChildren(
  doc: PNode,
  pos: number,
  reverse = true,
  recursive = true,
  filter: ({ from, to }: { from: number; to: number }) => boolean = () => true,
  stopCondition: ({ from, to }: { from: number; to: number }) => boolean = () =>
    false,
  startIndex?: number,
): Generator<{ from: number; to: number }, void> {
  const node = pos === -1 ? doc : doc.nodeAt(pos);
  if (!node) {
    throw new Error('No node found at provided position');
  }
  if (startIndex === undefined || startIndex === null) {
    startIndex = reverse ? node.childCount - 1 : 0;
  }
  if (reverse) {
    let offset = node.content.size;
    for (let i = node.childCount - 1; i >= 0; i--) {
      offset -= node.child(i).nodeSize;
      if (i <= startIndex) {
        const childRange = {
          from: pos + 1 + offset,
          to: pos + 1 + offset + node.child(i).nodeSize,
        };
        if (stopCondition(childRange)) {
          return;
        }
        if (recursive) {
          yield* findChildren(doc, childRange.from, reverse, recursive, filter);
        }
        if (filter(childRange)) {
          yield childRange;
        }
      }
    }
  } else {
    let offset = 0;
    for (let i = 0; i < node.childCount; i++) {
      if (i >= startIndex) {
        const childRange = {
          from: pos + 1 + offset,
          to: pos + 1 + offset + node.child(i).nodeSize,
        };
        if (stopCondition(childRange)) {
          return;
        }
        if (filter(childRange)) {
          yield childRange;
        }
        if (recursive) {
          yield* findChildren(doc, childRange.from, reverse, recursive, filter);
        }
      }
      offset += node.child(i).nodeSize;
    }
  }
}

type FindNodesArgs = {
  doc: PNode;
  start: number;
  end?: number;
  visitParentUpwards?: boolean;
  reverse?: boolean;
  filter?: ({ from, to }: { from: number; to: number }) => boolean;
};

export function* findNodes({
  doc,
  visitParentUpwards = false,
  reverse = false,
  start,
  end = reverse ? 0 : doc.nodeSize,
  filter = () => true,
}: FindNodesArgs): Generator<{ from: number; to: number }, undefined> {
  if ((reverse && start < end) || (!reverse && start > end)) {
    return;
  }
  if (start === -1) {
    throw new Error('Starting position may not lay before root node');
  }
  const fromResolved = doc.resolve(start);
  let startIndex: number;
  const index = fromResolved.index();
  const indexAfter = fromResolved.indexAfter();
  if (reverse) {
    startIndex = index === indexAfter ? index - 1 : index;
  } else {
    startIndex = index;
  }
  const parentRange = {
    from: fromResolved.depth > 0 ? fromResolved.before() : -1,
    to: fromResolved.depth > 0 ? fromResolved.after() : doc.nodeSize,
  };
  yield* findChildren(
    doc,
    parentRange.from,
    reverse,
    true,
    filter,
    ({ from, to }) => {
      return (reverse && to < end) || (!reverse && from > end);
    },
    startIndex,
  );
  if (visitParentUpwards && fromResolved.depth !== 0) {
    if (filter(parentRange)) {
      yield parentRange;
    }
    yield* findNodes({
      doc,
      start: reverse ? parentRange.from : parentRange.to,
      end,
      visitParentUpwards,
      reverse,
      filter,
    });
  }
  return;
}
