import {
  AllSelection,
  type Command,
  NodeSelection,
  TextSelection,
} from 'prosemirror-state';
import type { Attrs, NodeSpec, NodeType } from '..';
import { ContentMatch, Node as PNode } from 'prosemirror-model';
import type { Option } from '#root/utils/_private/option';

export function specCanSplit(spec: NodeSpec): boolean {
  return (spec['canSplit'] as Option<boolean>) ?? true;
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
  typesAfter?: (null | { type: NodeType; attrs?: Attrs | null })[],
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
      $pos.parent.content.cutByIndex($pos.index(), $pos.parent.childCount),
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
      baseType ? baseType.type : $pos.node(base + 1).type,
    );
}

function defaultBlockAt(match: ContentMatch) {
  for (let i = 0; i < match.edgeCount; i++) {
    const { type } = match.edge(i);
    if (type.isTextblock && !type.hasRequiredAttrs()) {
      return type;
    }
  }
  return null;
}

export const splitBlockChecked =
  (
    splitNode?: (
      node: PNode,
      atEnd: boolean,
    ) => { type: NodeType; attrs?: Attrs } | null,
  ): Command =>
  (state, dispatch) => {
    const { $from, $to } = state.selection;
    if (
      state.selection instanceof NodeSelection &&
      state.selection.node.isBlock
    ) {
      if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) {
        return false;
      }
      if (dispatch) {
        dispatch(state.tr.split($from.pos).scrollIntoView());
      }
      return true;
    }

    if (!$from.parent.isBlock) {
      return false;
    }

    if (dispatch) {
      const atEnd = $to.parentOffset === $to.parent.content.size;
      const tr = state.tr;
      if (
        state.selection instanceof TextSelection ||
        state.selection instanceof AllSelection
      )
        tr.deleteSelection();
      const deflt =
        $from.depth == 0
          ? null
          : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));
      const splitType = splitNode && splitNode($to.parent, atEnd);
      let types = splitType
        ? [splitType]
        : atEnd && deflt
          ? [{ type: deflt }]
          : undefined;
      let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);
      if (
        !types &&
        !can &&
        canSplit(
          tr.doc,
          tr.mapping.map($from.pos),
          1,
          deflt ? [{ type: deflt }] : undefined,
        )
      ) {
        if (deflt) {
          types = [{ type: deflt }];
        }
        can = true;
      }
      if (can) {
        tr.split(tr.mapping.map($from.pos), 1, types);
        if (!atEnd && !$from.parentOffset && $from.parent.type != deflt) {
          const first = tr.mapping.map($from.before()),
            $first = tr.doc.resolve(first);
          if (
            deflt &&
            $from
              .node(-1)
              .canReplaceWith($first.index(), $first.index() + 1, deflt)
          )
            tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
        }
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
