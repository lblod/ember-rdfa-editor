import { Attrs, NodeRange, NodeType } from 'prosemirror-model';
import { Command, NodeSelection } from 'prosemirror-state';
import { findWrapping } from 'prosemirror-transform';

/**
 * Wrap the selection in the given node type. Optionally define arbitrary attrs from the wrapped
 * nodes
 **/
export function wrapSelection(
  nodeType: NodeType,
  attrsFromWrapped?: (nodeRange: NodeRange) => Attrs,
): Command {
  return function (state, dispatch) {
    if (state.selection.empty) {
      if (dispatch) {
        const { from } = state.selection;
        const tr = state.tr;
        tr.insert(from, nodeType.create());
        const selection = NodeSelection.create(tr.doc, from);
        tr.setSelection(selection);
        dispatch(tr);
      }
      return true;
    } else {
      const { $from, $to } = state.selection;
      const nodeRange = new NodeRange($from, $to, $from.sharedDepth($to.pos));
      if (!nodeRange) {
        return false;
      }
      const wrappers = attrsFromWrapped
        ? findWrapping(nodeRange, nodeType, attrsFromWrapped(nodeRange))
        : findWrapping(nodeRange, nodeType);
      if (!wrappers) {
        return false;
      }
      if (dispatch) {
        const tr = state.tr;
        tr.wrap(nodeRange, wrappers);
        const selection = NodeSelection.create(tr.doc, nodeRange.$from.pos);
        tr.setSelection(selection);
        dispatch(tr);
      }
      return true;
    }
  };
}
