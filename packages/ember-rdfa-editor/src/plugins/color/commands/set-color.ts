import type { Command } from 'prosemirror-state';
import { toggleMark } from 'prosemirror-commands';

export function setColor(color: string): Command {
  return function (state, dispatch) {
    if (dispatch) {
      const { schema, selection } = state;
      const markAttrs = { color };
      const tr = state.tr;
      if (selection.empty) {
        const mark = schema.marks['color'].create(markAttrs);
        tr.addStoredMark(mark);
      } else {
        return toggleMark(schema.marks['color'], markAttrs, {
          removeWhenPresent: false,
        })(state, dispatch);
      }
      dispatch(tr);
    }
    return true;
  };
}
