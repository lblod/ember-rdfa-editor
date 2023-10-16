import { findNodeByRdfaId } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command, NodeSelection } from 'prosemirror-state';

type SelectNodeByRdfaIdArgs = {
  rdfaId: string;
};

export function selectNodeByRdfaId({
  rdfaId,
}: SelectNodeByRdfaIdArgs): Command {
  return (state, dispatch) => {
    const resolvedNode = findNodeByRdfaId(state.doc, rdfaId);
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
