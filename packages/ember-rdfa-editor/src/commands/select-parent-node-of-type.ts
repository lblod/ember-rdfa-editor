import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { NodeType } from 'prosemirror-model';
import { type Command, NodeSelection } from 'prosemirror-state';

const selectParentNodeOfType: (type: NodeType) => Command = (type) => {
  return (state, dispatch) => {
    const parent = findParentNodeOfType(type)(state.selection);
    if (!parent || !NodeSelection.isSelectable(parent.node)) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      tr.setSelection(NodeSelection.create(tr.doc, parent.pos));
      dispatch(tr);
    }
    return true;
  };
};

export default selectParentNodeOfType;
