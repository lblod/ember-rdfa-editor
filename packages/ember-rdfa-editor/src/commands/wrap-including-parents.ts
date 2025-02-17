import type { Command } from 'prosemirror-state';
import type { Attrs, NodeType } from 'prosemirror-model';
import { findHowToWrapIncludingParents } from '../utils/wrap-utils.ts';

/**
 * Wrap the selection in a node of the given type with the given attributes.
 * If the selection is unwrappable, try the parent nodes, to wrap e.g. lists.
 * For gap cursors, there is nothing to wrap, but create a node if possible.
 * Adapted from prosemirror-commands wrapIn
 */
export function wrapIncludingParents(
  nodeType: NodeType,
  attrs: Attrs | null = null,
): Command {
  return function (state, dispatch) {
    const tr = findHowToWrapIncludingParents(state, nodeType, attrs);
    if (tr) {
      if (dispatch) dispatch(tr);
      return true;
    } else {
      return false;
    }
  };
}
