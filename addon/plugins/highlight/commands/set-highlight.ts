import { Command, Selection } from 'prosemirror-state';

export function setHighlight(color: string): Command {
  return function (state, dispatch) {
    if (dispatch) {
      const { schema, selection } = state;
      const mark = schema.marks.highlight.create({ value: color });
      const tr = state.tr;
      if (selection.empty) {
        tr.addStoredMark(mark);
      } else {
        tr.addMark(tr.selection.from, tr.selection.to, mark).setSelection(
          Selection.near(tr.selection.$to)
        );
      }
      dispatch(tr);
    }
    return true;
  };
}
