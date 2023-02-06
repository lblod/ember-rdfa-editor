import { splitBlock } from 'prosemirror-commands';
import { Command } from 'prosemirror-state';
import { Attrs, NodeSpec, NodeType } from '..';
import { Node as PNode } from 'prosemirror-model';
import { Option } from '@lblod/ember-rdfa-editor/utils/option';

function specCanSplit(spec: NodeSpec): boolean {
  return (spec.canSplit as Option<boolean>) ?? true;
}

declare module 'prosemirror-model' {
  export interface Fragment {
    cutByIndex(from: number, to: number): Fragment;
  }
}

/**
 * Adapted from https://github.com/ProseMirror/prosemirror-transform/blob/8d6be028eebb28a2d981dee146eacdd2c1cffcd4/src/structure.ts#L154
 * to check for custom canSplit spec property
 * @param doc
 * @param pos
 * @param depth
 * @param typesAfter
 */
export function canSplit(
  doc: PNode,
  pos: number,
  depth = 1,
  typesAfter?: (null | { type: NodeType; attrs?: Attrs | null })[]
): boolean {
  const $pos = doc.resolve(pos);
  const base = $pos.depth - depth;
  const innerType =
    (typesAfter && typesAfter[typesAfter.length - 1]) || $pos.parent;
  if (
    base < 0 ||
    $pos.parent.type.spec.isolating ||
    !specCanSplit($pos.parent.type.spec) ||
    !$pos.parent.canReplace($pos.index(), $pos.parent.childCount) ||
    !innerType.type.validContent(
      $pos.parent.content.cutByIndex($pos.index(), $pos.parent.childCount)
    )
  )
    return false;
  for (let d = $pos.depth - 1, i = depth - 2; d > base; d--, i--) {
    const node = $pos.node(d);
    const index = $pos.index(d);
    if (node.type.spec.isolating || !specCanSplit(node.type.spec)) {
      return false;
    }
    let rest = node.content.cutByIndex(index, node.childCount);
    const after = (typesAfter && typesAfter[i]) || node;
    if (after != node) {
      rest = rest.replaceChild(0, after.type.create(after.attrs));
    }
    if (
      !node.canReplace(index + 1, node.childCount) ||
      !after.type.validContent(rest)
    ) {
      return false;
    }
  }
  const index = $pos.indexAfter(base);
  const baseType = typesAfter && typesAfter[0];
  return $pos
    .node(base)
    .canReplaceWith(
      index,
      index,
      baseType ? baseType.type : $pos.node(base + 1).type
    );
}

export const splitBlockChecked: Command = (state, dispatch, view) => {
  const { $from } = state.selection;
  //TODO: doing a full custom canSplit check is a bit of a waste because splitBlock does that again
  if (canSplit(state.doc, $from.pos, $from.depth)) {
    return splitBlock(state, dispatch, view);
  }
  return false;
};
