import { Command, Selection } from 'prosemirror-state';

export const clearColor: Command = (state, dispatch) => {
  if (dispatch) {
    const { selection, schema } = state;
    const tr = state.tr;
    if (selection.empty) {
      tr.removeStoredMark(schema.marks.color);
    } else {
      tr.removeMark(
        selection.from,
        selection.to,
        schema.marks.color
      ).setSelection(Selection.near(tr.selection.$to));
    }
    dispatch(tr);
  }
  return true;
};
