import { Command } from 'prosemirror-state';

export function insertHardBreak(): Command {
  return function (state, dispatch) {
    if (dispatch) {
      const tr = state.tr;
      tr.replaceSelectionWith(state.schema.nodes.hard_break.create());
      tr.scrollIntoView();
      if (tr.docChanged) {
        dispatch(tr);
      } else {
        return false;
      }
    }
    return true;
  };
}
