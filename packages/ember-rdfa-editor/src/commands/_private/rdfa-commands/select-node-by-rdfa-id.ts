import { getNodeByRdfaId } from '#root/plugins/rdfa-info/index.ts';
import { AllSelection, type Command, NodeSelection } from 'prosemirror-state';

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
