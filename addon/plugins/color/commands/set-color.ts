import { Command } from 'prosemirror-state';
import { toggleMarkAddFirst } from '@lblod/ember-rdfa-editor/commands/toggle-mark-add-first';

export function setColor(color: string): Command {
  return function (state, dispatch) {
    if (dispatch) {
      const { schema, selection } = state;
      const markAttrs = { color };
      const tr = state.tr;
      if (selection.empty) {
        const mark = schema.marks.color.create(markAttrs);
        tr.addStoredMark(mark);
      } else {
        return toggleMarkAddFirst(schema.marks.color, markAttrs)(
          state,
          dispatch,
        );
      }
      dispatch(tr);
    }
    return true;
  };
}
