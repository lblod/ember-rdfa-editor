import { PNode } from '@lblod/ember-rdfa-editor';
import { Attrs, MarkType } from 'prosemirror-model';
import { Command, SelectionRange, TextSelection } from 'prosemirror-state';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';

export function rangeHasMarkEverywhere(
  root: PNode,
  from: number,
  to: number,
  markType: MarkType,
) {
  let found = false;
  let keepSearching = true;
  if (to > from) {
    root.nodesBetween(from, to, (node) => {
      if (node.isText && keepSearching) {
        const hasMark = !!markType.isInSet(node.marks);
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
 * Adapted from https://github.com/ProseMirror/prosemirror-commands/blob/7635496296b2e561a5893b03154bd89c127a6972/src/commands.ts#L579
 * Create a command function that toggles the given mark with the
 * given attributes. Will return `false` when the current selection
 * doesn't support that mark. This will remove the mark if any marks
 * of that type exist in the selection, or add it otherwise. If the
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
        if (markType.isInSet(state.storedMarks || $cursor.marks())) {
          dispatch(state.tr.removeStoredMark(markType));
        } else {
          dispatch(state.tr.addStoredMark(markType.create(attrs)));
        }
      } else {
        let has = false;
        const tr = state.tr;
        for (let i = 0; !has && i < ranges.length; i++) {
          const { $from, $to } = ranges[i];
          has = rangeHasMarkEverywhere(state.doc, $from.pos, $to.pos, markType);
        }
        for (let i = 0; i < ranges.length; i++) {
          const { $from, $to } = ranges[i];
          if (has) {
            tr.removeMark($from.pos, $to.pos, markType);
          } else {
            let from = $from.pos;
            let to = $to.pos;
            const start = $from.nodeAfter;
            const end = $to.nodeBefore;
            const spaceStart =
              start && start.isText
                ? unwrap(/^\s*/.exec(unwrap(start.text)))[0].length
                : 0;
            const spaceEnd =
              end && end.isText
                ? unwrap(/\s*$/.exec(unwrap(end.text)))[0].length
                : 0;
            if (from + spaceStart < to) {
              from += spaceStart;
              to -= spaceEnd;
            }
            tr.addMark(from, to, markType.create(attrs));
          }
        }
        dispatch(tr.scrollIntoView());
      }
    }
    return true;
  };
}
