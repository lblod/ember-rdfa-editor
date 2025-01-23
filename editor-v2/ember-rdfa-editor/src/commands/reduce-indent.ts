import { type Command, TextSelection } from 'prosemirror-state';

/**
 * Returns a command to indent something to the left if selection cursor is at the start of the node.
 * This is useful specifically for backspace, as this should only happen at the start of a node.
 * Only nodes with `indentationLevel` as node attribute can be indented.
 * @returns Command
 */
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
    !$cursor.parent.attrs['indentationLevel']
  ) {
    return false;
  }

  const paragraphPosition = $cursor.before($cursor.depth);
  const currentIndentationLevel = $cursor.parent.attrs[
    'indentationLevel'
  ] as number;

  if (dispatch) {
    const tr = state.tr.setNodeAttribute(
      paragraphPosition,
      'indentationLevel',
      currentIndentationLevel - 1,
    );

    dispatch(tr);

    return true;
  }

  return true;
};
