import { type Command } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';
import { wrapSelection } from '../../wrap-selection';

export function wrapInlineLiteral(): Command {
  return (state, dispatch) => {
    if (dispatch) {
      const objectId = uuidv4();
      const wrapStatus = wrapSelection(
        state.schema.nodes['inline_rdfa'],
        () => ({
          __rdfaId: objectId,
          rdfaNodeType: 'literal',
        }),
      )(state, dispatch);

      return wrapStatus;
    }
    return true;
  };
}
