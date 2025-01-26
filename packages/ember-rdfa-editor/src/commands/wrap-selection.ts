import { type Attrs, NodeRange, NodeType } from 'prosemirror-model';
import { type Command, NodeSelection } from 'prosemirror-state';
import { findWrapping } from 'prosemirror-transform';

/**
 * Wrap the selection in the given node type. Optionally define arbitrary attrs from the wrapped
 * nodes (undefined if selection is empty).
 **/
export function wrapSelection(
  nodeType: NodeType,
  attrsFromWrapped?: (nodeRange?: NodeRange) => Attrs | null,
): Command {
  return function (state, dispatch) {
    if (state.selection.empty) {
      if (dispatch) {
        const { from } = state.selection;
        const tr = state.tr;
        const attrs = attrsFromWrapped && attrsFromWrapped();
        tr.insert(from, nodeType.create(attrs));
        if (tr.doc.resolve(from).nodeAfter) {
          const selection = NodeSelection.create(tr.doc, from);
          tr.setSelection(selection);
        }
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
