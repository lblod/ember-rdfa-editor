import { PNode } from '@lblod/ember-rdfa-editor';
import { Attrs, MarkType, ResolvedPos } from 'prosemirror-model';
import { Command, SelectionRange, TextSelection } from 'prosemirror-state';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { shallowEqual } from '@lblod/ember-rdfa-editor/utils/_private/object-utils';

/**
 * Check that between 2 positions in a Node the same mark is set. Optionally only consider marks
 * equal if they have the same attributes.
 **/
export function rangeHasMarkEverywhere(
  root: PNode,
  from: number,
  to: number,
  markType: MarkType,
  markAttrs?: Attrs | null,
) {
  let found = false;
  let keepSearching = true;
  if (to > from) {
    root.nodesBetween(from, to, (node) => {
      if (node.isText && keepSearching) {
        const mark = markType.isInSet(node.marks);
        const hasMark =
          !!mark && (!markAttrs || shallowEqual(markAttrs, mark.attrs));
        found = hasMark;
        if (!hasMark) {
          keepSearching = false;
        }
      }
      return keepSearching;
    });
  }
  return found;
}

function markApplies(
  doc: PNode,
  ranges: readonly SelectionRange[],
  type: MarkType,
) {
  for (let i = 0; i < ranges.length; i++) {
    const { $from, $to } = ranges[i];
    let can =
      $from.depth == 0
        ? doc.inlineContent && doc.type.allowsMarkType(type)
        : false;
    doc.nodesBetween($from.pos, $to.pos, (node) => {
      if (can) {
        return false;
      }
      can = node.inlineContent && node.type.allowsMarkType(type);
      return true;
    });
    if (can) {
      return true;
    }
  }
  return false;
}

/**
 * return { from, to } with the positions adjusted so any starting or ending spaces
 * are not part of the range anymore.
 **/
function fromToWithoutEdgeSpaces(
  $from: ResolvedPos,
  $to: ResolvedPos,
): { from: number; to: number } {
  let from = $from.pos;
  let to = $to.pos;
  const start = $from.nodeAfter;
  const end = $to.nodeBefore;

  const spaceStart =
    start && start.isText
      ? unwrap(/^\s*/.exec(unwrap(start.text)))[0].length
      : 0;
  const spaceEnd =
    end && end.isText ? unwrap(/\s*$/.exec(unwrap(end.text)))[0].length : 0;
  if (from + spaceStart < to) {
    from += spaceStart;
    to -= spaceEnd;
  }
  return { from, to };
}

/**
 * Adapted from https://github.com/ProseMirror/prosemirror-commands/blob/7635496296b2e561a5893b03154bd89c127a6972/src/commands.ts#L579
 * Create a command function that toggles the given mark with the
 * given attributes. Will return `false` when the current selection
 * doesn't support that mark. This adds the mark if any marks of that type
 * are missing in the selection, or remove it from the whole selection otherwise.* If the
 * selection is empty, this applies to the {@link EditorState#storedMarks stored marks}
 * instead of a range of the document.
 *
 * @param markType
 * @param attrs
 */
export function toggleMarkAddFirst(
  markType: MarkType,
  attrs: Attrs | null = null,
): Command {
  return function (state, dispatch) {
    const { empty, $cursor, ranges } = state.selection as TextSelection;
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) {
      return false;
    }
    if (dispatch) {
      if ($cursor) {
        const mark = markType.isInSet(state.storedMarks || $cursor.marks());
        if (mark && (!attrs || shallowEqual(attrs, mark.attrs))) {
          dispatch(state.tr.removeStoredMark(markType));
        } else {
          dispatch(state.tr.addStoredMark(markType.create(attrs)));
        }
      } else {
        // 'has' will remain true only if all of the ranges have the mark everywhere
        let has = true;
        const tr = state.tr;
        for (let i = 0; has && i < ranges.length; i++) {
          const { $from, $to } = ranges[i];
          // don't check the spaces before and after, as these might not contain the mark
          // as expected because of the special `space logic` below.
          const { from, to } = fromToWithoutEdgeSpaces($from, $to);
          has = rangeHasMarkEverywhere(state.doc, from, to, markType, attrs);
        }
        for (let i = 0; i < ranges.length; i++) {
          const { $from, $to } = ranges[i];
          if (has) {
            tr.removeMark($from.pos, $to.pos, markType);
          } else {
            // ### space logic ###
            // if adding marks, do not add it the starting/final spaces,
            // to avoid the mark still applying when typing behind this space.
            // e.g. with text (between * highlighted)= `*ab *some text`, and setting bold
            // we don't want to have the new typed text be bold if putting the cursor between `*s`.
            const { from, to } = fromToWithoutEdgeSpaces($from, $to);
            tr.addMark(from, to, markType.create(attrs));
          }
        }
        dispatch(tr.scrollIntoView());
      }
    }
    return true;
  };
}
