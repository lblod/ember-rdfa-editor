import type { Command } from 'prosemirror-state';
import { toggleMark } from 'prosemirror-commands';

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
        return toggleMark(schema.marks['highlight'], markAttrs, {
          removeWhenPresent: false,
        })(state, dispatch);
      }
      dispatch(tr);
    }
    return true;
  };
}
