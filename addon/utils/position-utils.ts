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
