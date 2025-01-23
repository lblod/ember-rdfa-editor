import { getNodesBySubject } from '#root/plugins/rdfa-info/index.ts';
import { AllSelection, type Command, NodeSelection } from 'prosemirror-state';

type SelectNodeBySubjectArgs = {
  subject: string;
};

/**
 * Command which moves the selection to the first node that defines the provided subject
 */
export function selectNodeBySubject({
  subject,
}: SelectNodeBySubjectArgs): Command {
  return (state, dispatch) => {
    const target = getNodesBySubject(state, subject)?.[0];
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
