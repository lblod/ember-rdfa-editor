import { Command, TextSelection } from 'prosemirror-state';

export const reduceIndent: Command = (state, dispatch) => {
  if (!(state.selection instanceof TextSelection)) {
    return false;
  }

  const { $cursor } = state.selection;

  if (
    !$cursor ||
    // Skip action at the start of document
    $cursor.pos === 0 ||
    // Skip action if cursor is not at the first position of "child"
    $cursor.parentOffset !== 0 ||
    // Skip action node has no existing "indentationLevel"
    !$cursor.parent.attrs.indentationLevel
  ) {
    return false;
  }

  const paragraphPosition = $cursor.before($cursor.depth);
  const currentIndentationLevel = $cursor.parent.attrs
    .indentationLevel as number;

  if (dispatch) {
    const tr = state.tr.setNodeAttribute(
      paragraphPosition,
      'indentationLevel',
      currentIndentationLevel - 1
    );

    dispatch(tr);

    return true;
  }

  return true;
};
