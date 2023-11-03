import { getNodeByRdfaId } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { Command, NodeSelection } from 'prosemirror-state';

type SelectNodeByRdfaIdArgs = {
  rdfaId: string;
};

export function selectNodeByRdfaId({
  rdfaId,
}: SelectNodeByRdfaIdArgs): Command {
  return (state, dispatch) => {
    const target = getNodeByRdfaId(state, rdfaId);
    if (!target) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      tr.setSelection(
        new NodeSelection(tr.doc.resolve(target.pos)),
      ).scrollIntoView();
      dispatch(tr);
    }
    return true;
  };
}
