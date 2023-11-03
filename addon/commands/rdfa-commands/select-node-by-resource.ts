import { getPositionsByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
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
    const target = getPositionsByResource(state, resource)?.[0];
    if (!target) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      tr.setSelection(new NodeSelection(target)).scrollIntoView();
      dispatch(tr);
    }
    return true;
  };
}
