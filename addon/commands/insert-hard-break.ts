import { Command } from 'prosemirror-state';

export const insertHardBreak: Command = (state, dispatch) => {
  if (dispatch)
    dispatch(
      state.tr
        .replaceSelectionWith(state.schema.nodes.hard_break.create())
        .scrollIntoView(),
    );
  return true;
};
