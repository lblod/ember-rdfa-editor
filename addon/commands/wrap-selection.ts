import { NodeRange, NodeType } from 'prosemirror-model';
import { Command } from 'prosemirror-state';
import { findWrapping } from 'prosemirror-transform';

export function wrapSelection(nodeType: NodeType): Command {
  return function (state, dispatch) {
    if (state.selection.empty) {
      if (dispatch) {
        const tr = state.tr;
        tr.replaceSelectionWith(nodeType.create());
        dispatch(tr);
      }
      return true;
    } else {
      const { $from, $to } = state.selection;
      const nodeRange = new NodeRange($from, $to, $from.sharedDepth($to.pos));
      if (!nodeRange) {
        return false;
      }
      const wrappers = findWrapping(nodeRange, nodeType);
      if (!wrappers) {
        return false;
      }
      if (dispatch) {
        const tr = state.tr;
        tr.wrap(nodeRange, wrappers);
        dispatch(tr);
      }
      return true;
    }
  };
}
