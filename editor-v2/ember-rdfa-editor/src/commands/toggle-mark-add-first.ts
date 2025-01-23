import type { Attrs, MarkType } from 'prosemirror-model';
import type { Command, TextSelection } from 'prosemirror-state';
import { shallowEqual } from '#root/utils/_private/object-utils';
import {
  fromToWithoutEdgeSpaces,
  markApplies,
  selectionHasMarkEverywhere,
} from '#root/utils/_private/mark-utils';

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
        const hasEverywhere = selectionHasMarkEverywhere(
          state.doc,
          state.selection,
          markType,
          attrs ?? undefined,
        );
        const tr = state.tr;
        for (let i = 0; i < ranges.length; i++) {
          const { $from, $to } = ranges[i];
          if (hasEverywhere) {
            tr.removeMark($from.pos, $to.pos, markType);
          } else {
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
