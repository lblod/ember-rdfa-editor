import {
  canJoin,
  canSplit,
  findWrapping,
  liftTarget,
  ReplaceAroundStep,
} from 'prosemirror-transform';
import { Attrs, Fragment, NodeRange, NodeType, Slice } from 'prosemirror-model';
import {
  Command,
  EditorState,
  NodeSelection,
  Selection,
  Transaction,
} from 'prosemirror-state';
import { isSome, unwrap } from '@lblod/ember-rdfa-editor/utils/option';

/// Returns a command function that wraps the selection in a list with
/// the given type an attributes. If `dispatch` is null, only return a
/// value to indicate whether this is possible, but don't actually
/// perform the change.
export function wrapInList(
  listType: NodeType,
  attrs: Attrs | null = null
): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { $from, $to } = state.selection;
    let $startOfBlockRange = $from;
    for (let depth = $from.depth; depth >= 0; depth--) {
      if ($from.node(depth).type.isBlock) {
        $startOfBlockRange = state.doc.resolve($from.posAtIndex(0, depth));
        break;
      }
    }
    let range = $startOfBlockRange.blockRange($to);
    let doJoin = false;
    if (!range) {
      return false;
    }
    let outerRange = range;
    // This is at the top of an existing list item
    if (
      range.depth >= 2 &&
      $from.node(range.depth - 1).type.compatibleContent(listType) &&
      range.startIndex === 0
    ) {
      // Don't do anything if this is the top of the list
      if ($from.index(range.depth - 1) === 0) {
        return false;
      }
      const $insert = state.doc.resolve(range.start - 2);
      outerRange = new NodeRange($insert, $insert, range.depth);
      if (range.endIndex < range.parent.childCount) {
        range = new NodeRange(
          $from,
          state.doc.resolve($to.end(range.depth)),
          range.depth
        );
      }
      doJoin = true;
    }
    const wrap = findWrapping(outerRange, listType, attrs, range);
    if (!wrap) {
      return false;
    }
    if (dispatch)
      dispatch(
        doWrapInList(state.tr, range, wrap, doJoin, listType).scrollIntoView()
      );
    return true;
  };
}

function doWrapInList(
  tr: Transaction,
  range: NodeRange,
  wrappers: { type: NodeType; attrs?: Attrs | null }[],
  joinBefore: boolean,
  listType: NodeType
) {
  let content = Fragment.empty;
  for (let i = wrappers.length - 1; i >= 0; i--)
    content = Fragment.from(
      wrappers[i].type.create(wrappers[i].attrs, content)
    );

  tr.step(
    new ReplaceAroundStep(
      range.start - (joinBefore ? 2 : 0),
      range.end,
      range.start,
      range.end,
      new Slice(content, 0, 0),
      wrappers.length,
      true
    )
  );

  let found = 0;
  for (let i = 0; i < wrappers.length; i++) {
    if (wrappers[i].type === listType) {
      found = i + 1;
    }
  }
  const splitDepth = wrappers.length - found;

  let splitPos = range.start + wrappers.length - (joinBefore ? 2 : 0);
  const parent = range.parent;
  for (
    let i = range.startIndex, e = range.endIndex, first = true;
    i < e;
    i++, first = false
  ) {
    if (!first && canSplit(tr.doc, splitPos, splitDepth)) {
      tr.split(splitPos, splitDepth);
      splitPos += 2 * splitDepth;
    }
    splitPos += parent.child(i).nodeSize;
  }
  return tr;
}

/// Build a command that splits a non-empty textblock at the top level
/// of a list item by also splitting that list item.
export function splitListItem(itemType: NodeType): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { $from, $to, node } = state.selection as NodeSelection;
    if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to)) {
      return false;
    }
    const grandParent = $from.node(-1);
    if (grandParent.type !== itemType) {
      return false;
    }
    if (
      $from.parent.content.size === 0 &&
      $from.node(-1).childCount === $from.indexAfter(-1)
    ) {
      // In an empty block. If this is a nested list, the wrapping
      // list item should be split. Otherwise, bail out and let next
      // command handle lifting.
      if (
        $from.depth === 3 ||
        $from.node(-3).type !== itemType ||
        $from.index(-2) !== $from.node(-2).childCount - 1
      ) {
        return false;
      }
      if (dispatch) {
        let wrap = Fragment.empty;
        const depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;
        // Build a fragment containing empty versions of the structure
        // from the outer list item to the parent node of the cursor
        for (let d = $from.depth - depthBefore; d >= $from.depth - 3; d--) {
          wrap = Fragment.from($from.node(d).copy(wrap));
        }
        const depthAfter =
          $from.indexAfter(-1) < $from.node(-2).childCount
            ? 1
            : $from.indexAfter(-2) < $from.node(-3).childCount
            ? 2
            : 3;
        // Add a second list item with an empty default start node
        wrap = wrap.append(Fragment.from(itemType.createAndFill()));
        const start = $from.before($from.depth - (depthBefore - 1));
        const tr = state.tr.replace(
          start,
          $from.after(-depthAfter),
          new Slice(wrap, 4 - depthBefore, 0)
        );
        let sel = -1;
        tr.doc.nodesBetween(start, tr.doc.content.size, (node, pos) => {
          if (sel > -1) {
            return false;
          }
          if (node.isTextblock && node.content.size === 0) {
            sel = pos + 1;
          }
          return true;
        });
        if (sel > -1) {
          tr.setSelection(Selection.near(tr.doc.resolve(sel)));
        }
        dispatch(tr.scrollIntoView());
      }
      return true;
    }
    const nextType =
      $to.pos === $from.end()
        ? grandParent.contentMatchAt(0).defaultType
        : null;
    const tr = state.tr.delete($from.pos, $to.pos);
    const types = nextType ? [null, { type: nextType }] : undefined;
    if (!canSplit(tr.doc, $from.pos, 2, types)) {
      return false;
    }
    if (dispatch) {
      dispatch(tr.split($from.pos, 2, types).scrollIntoView());
    }
    return true;
  };
}

/// Create a command to lift the list item around the selection up into
/// a wrapping list.
export function liftListItem(itemType: NodeType): Command {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const { $from, $to } = state.selection;
    const range = $from.blockRange(
      $to,
      (node) =>
        node.childCount > 0 &&
        isSome(node.firstChild) &&
        node.firstChild.type === itemType
    );
    if (!range) {
      return false;
    }
    if (!dispatch) {
      return true;
    }
    if ($from.node(range.depth - 1).type === itemType) {
      // Inside a parent list
      return liftToOuterList(state, dispatch, itemType, range);
    }
    // Outer list node
    else {
      return liftOutOfList(state, dispatch, range);
    }
  };
}

function liftToOuterList(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  itemType: NodeType,
  range: NodeRange
) {
  const tr = state.tr,
    end = range.end,
    endOfList = range.$to.end(range.depth);
  if (end < endOfList) {
    // There are siblings after the lifted items, which must become
    // children of the last item
    tr.step(
      new ReplaceAroundStep(
        end - 1,
        endOfList,
        end,
        endOfList,
        new Slice(
          Fragment.from(itemType.create(null, range.parent.copy())),
          1,
          0
        ),
        1,
        true
      )
    );
    range = new NodeRange(
      tr.doc.resolve(range.$from.pos),
      tr.doc.resolve(endOfList),
      range.depth
    );
  }
  const target = liftTarget(range);
  if (target === null) {
    return false;
  }
  tr.lift(range, target);
  const after = tr.mapping.map(end, -1) - 1;
  if (canJoin(tr.doc, after)) {
    tr.join(after);
  }
  dispatch(tr.scrollIntoView());
  return true;
}

function liftOutOfList(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  range: NodeRange
) {
  const tr = state.tr;
  const list = range.parent;
  // Merge the list items into a single big item
  for (
    let pos = range.end, i = range.endIndex - 1, e = range.startIndex;
    i > e;
    i--
  ) {
    pos -= list.child(i).nodeSize;
    tr.delete(pos - 1, pos + 1);
  }
  const $start = tr.doc.resolve(range.start);
  const item = unwrap($start.nodeAfter);
  if (tr.mapping.map(range.end) !== range.start + item.nodeSize) {
    return false;
  }
  const atStart = range.startIndex === 0;
  const atEnd = range.endIndex === list.childCount;
  const parent = $start.node(-1);
  const indexBefore = $start.index(-1);
  if (
    !parent.canReplace(
      indexBefore + (atStart ? 0 : 1),
      indexBefore + 1,
      item.content.append(atEnd ? Fragment.empty : Fragment.from(list))
    )
  ) {
    return false;
  }
  const start = $start.pos;
  const end = start + item.nodeSize;
  // Strip off the surrounding list. At the sides where we're not at
  // the end of the list, the existing list is closed. At sides where
  // this is the end, it is overwritten to its end.
  tr.step(
    new ReplaceAroundStep(
      start - (atStart ? 1 : 0),
      end + (atEnd ? 1 : 0),
      start + 1,
      end - 1,
      new Slice(
        (atStart
          ? Fragment.empty
          : Fragment.from(list.copy(Fragment.empty))
        ).append(
          atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))
        ),
        atStart ? 0 : 1,
        atEnd ? 0 : 1
      ),
      atStart ? 0 : 1
    )
  );
  dispatch(tr.scrollIntoView());
  return true;
}

/// Create a command to sink the list item around the selection down
/// into an inner list.
export function sinkListItem(itemType: NodeType): Command {
  return function (state, dispatch) {
    const { $from, $to } = state.selection;
    const range = $from.blockRange(
      $to,
      (node) =>
        node.childCount > 0 &&
        isSome(node.firstChild) &&
        node.firstChild.type === itemType
    );
    if (!range) {
      return false;
    }
    const startIndex = range.startIndex;
    if (startIndex === 0) {
      return false;
    }
    const parent = range.parent;
    const nodeBefore = parent.child(startIndex - 1);
    if (nodeBefore.type !== itemType) {
      return false;
    }

    if (dispatch) {
      const nestedBefore =
        nodeBefore.lastChild && nodeBefore.lastChild.type === parent.type;
      const inner = Fragment.from(nestedBefore ? itemType.create() : null);
      const slice = new Slice(
        Fragment.from(
          itemType.create(null, Fragment.from(parent.type.create(null, inner)))
        ),
        nestedBefore ? 3 : 1,
        0
      );
      const before = range.start,
        after = range.end;
      dispatch(
        state.tr
          .step(
            new ReplaceAroundStep(
              before - (nestedBefore ? 3 : 1),
              after,
              before,
              after,
              slice,
              1,
              true
            )
          )
          .scrollIntoView()
      );
    }
    return true;
  };
}
