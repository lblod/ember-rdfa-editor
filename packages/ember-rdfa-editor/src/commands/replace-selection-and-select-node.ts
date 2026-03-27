import { type Command, NodeSelection } from 'prosemirror-state';
import { Node } from 'prosemirror-model';

export const replaceSelectionWithAndSelectNode = (node: Node): Command => {
  return (state, dispatch) => {
    if (!node.type.spec.selectable) {
      return false;
    }

    if (dispatch) {
      const tr = state.tr;
      tr.replaceSelectionWith(node);
      if (tr.selection.$anchor.nodeBefore) {
        const resolvedPos = tr.doc.resolve(
          tr.selection.anchor - tr.selection.$anchor.nodeBefore?.nodeSize,
        );
        tr.setSelection(new NodeSelection(resolvedPos));
      }
      dispatch(tr);
    }
    return true;
  };
};
