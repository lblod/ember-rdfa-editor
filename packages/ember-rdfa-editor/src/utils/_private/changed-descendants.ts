import { PNode } from '#root/prosemirror-aliases.ts';

// from https://github.com/ProseMirror/prosemirror-tables/blob/8ec1e96ae994c1585b07b1ca9dc3292f63e868e0/src/fixtables.ts#L24
export function changedDescendants(
  old: PNode,
  cur: PNode,
  offset: number,
  f: (node: PNode, pos: number) => void,
): void {
  const oldSize = old.childCount;
  const curSize = cur.childCount;
  outer: for (let i = 0, j = 0; i < curSize; i++) {
    const child = cur.child(i);
    for (let scan = j, e = Math.min(oldSize, i + 3); scan < e; scan++) {
      if (old.child(scan) === child) {
        j = scan + 1;
        offset += child.nodeSize;
        continue outer;
      }
    }
    f(child, offset);
    if (j < oldSize && old.child(j).sameMarkup(child)) {
      changedDescendants(old.child(j), child, offset + 1, f);
    } else {
      child.nodesBetween(0, child.content.size, f, offset + 1);
    }
    offset += child.nodeSize;
  }
}
