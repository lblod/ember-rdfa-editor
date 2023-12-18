import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { AllSelection, Command, NodeSelection } from 'prosemirror-state';

type SelectNodeByResourceArgs = {
  resource: string;
};

/**
 * Command which moves the selection to the first node that defines the provided resource
 */
export function selectNodeByResource({
  resource,
}: SelectNodeByResourceArgs): Command {
  return (state, dispatch, view) => {
    const target = getNodesByResource(state, resource)?.[0];
    if (!target) {
      return false;
    }
    if (!dispatch) {
      return true;
    }

    const tr = state.tr;
    if (target.pos === -1) {
      tr.setSelection(new AllSelection(tr.doc));
    } else {
      tr.setSelection(new NodeSelection(tr.doc.resolve(target.pos)));
    }
    tr.scrollIntoView();
    dispatch(tr);
    return true;
  };
}
