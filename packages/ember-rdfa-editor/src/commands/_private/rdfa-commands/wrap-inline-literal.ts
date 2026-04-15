import { type Command } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';
import { wrapSelection } from '../../wrap-selection.ts';

export function wrapInlineLiteral(isPointer?: boolean): Command {
  return (state, dispatch) => {
    if (dispatch) {
      const objectId = uuidv4();
      const wrapStatus = wrapSelection(
        state.schema.nodes['inline_rdfa'],
        () => ({
          __rdfaId: objectId,
          rdfaNodeType: 'literal',
          isPointer: !!isPointer,
        }),
      )(state, dispatch);

      return wrapStatus;
    }
    return true;
  };
}
