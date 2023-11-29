import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { Command, NodeSelection, TextSelection } from 'prosemirror-state';

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
    const resolved = tr.doc.resolve(target.pos);
    tr.setSelection(new NodeSelection(resolved)).scrollIntoView();
    dispatch(tr);
    return true;
  };
}
