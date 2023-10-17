import { findNodesByResource } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command, NodeSelection } from 'prosemirror-state';

type SelectNodeByResource = {
  resource: string;
};

/**
 * Command which moves the selection to the first node that defines the provided resource
 */
export function selectNodeByResource({
  resource,
}: SelectNodeByResource): Command {
  return (state, dispatch) => {
    const resolvedNode = findNodesByResource(state.doc, resource)[0];
    if (!resolvedNode) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      tr.setSelection(
        new NodeSelection(tr.doc.resolve(resolvedNode.pos)),
      ).scrollIntoView();
      dispatch(tr);
    }
    return true;
  };
}
