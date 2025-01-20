import type { Command } from 'prosemirror-state';
import type { Attrs, NodeType } from 'prosemirror-model';
import { findWrapping } from 'prosemirror-transform';
import { selectParentNode } from 'prosemirror-commands';
import { GapCursor } from '../plugins/gap-cursor';

/**
 * Wrap the selection in a node of the given type with the given attributes.
 * If the selection is unwrappable, try the parent nodes, to wrap e.g. lists.
 * Adapted from prosemirror-commands wrapIn
 */
export function wrapIncludingParents(
  nodeType: NodeType,
  attrs: Attrs | null = null,
): Command {
  return function (state, dispatch) {
    // Treat gap-cursor selections as a special case, do not wrap around its parent.
    // This ensures that its behaviour is similar as that of normal collapsed text cursors.
    if (state.selection instanceof GapCursor) {
      const { $from } = state.selection;
      const contentMatch = $from.parent.contentMatchAt($from.index());
      if(!contentMatch.matchType(nodeType)){
        return false;
      }
      const node = nodeType.createAndFill(attrs);
      if (!node) {
        return false;
      }
      if (dispatch) {
        dispatch(state.tr.replaceRangeWith($from.pos, $from.pos, node));
      }
      return true;
    }
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);
    const wrapping = range && findWrapping(range, nodeType, attrs);
    if (wrapping) {
      if (dispatch) dispatch(state.tr.wrap(range!, wrapping).scrollIntoView());
      return true;
    } else {
      return selectParentNode(state, (tr) => {
        const newState = state.apply(tr);
        return wrapIncludingParents(nodeType, attrs)(newState, dispatch);
      });
    }
  };
}
