import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
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
    const target = getNodesByResource(state, resource)?.[0];
    if (!target) {
      return false;
    }
    if (!dispatch) {
      return true;
    }

    const tr = state.tr;
    tr.setSelection(
      new NodeSelection(tr.doc.resolve(target.pos)),
    ).scrollIntoView();
    dispatch(tr);
    return true;
  };
}
