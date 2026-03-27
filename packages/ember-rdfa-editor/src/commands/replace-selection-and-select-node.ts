import { type Command, NodeSelection, PNode } from '@lblod/ember-rdfa-editor';

export const replaceSelectionWithAndSelectNode = (node: PNode): Command => {
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
