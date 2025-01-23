import type { Command } from 'prosemirror-state';
import { toggleMarkAddFirst } from '#root/commands/toggle-mark-add-first.ts';

export function setHighlight(color: string): Command {
  return function (state, dispatch) {
    if (dispatch) {
      const { schema, selection } = state;
      const markAttrs = { value: color };
      const tr = state.tr;
      if (selection.empty) {
        const mark = schema.marks['highlight'].create(markAttrs);
        tr.addStoredMark(mark);
      } else {
        return toggleMarkAddFirst(schema.marks['highlight'], markAttrs)(
          state,
          dispatch,
        );
      }
      dispatch(tr);
    }
    return true;
  };
}
