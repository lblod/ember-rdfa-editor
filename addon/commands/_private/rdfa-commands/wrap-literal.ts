import type { Command } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';
import { wrapIncludingParents } from '@lblod/ember-rdfa-editor/commands';
import { findRdfaIdsInSelection } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';

export function wrapLiteral(): Command {
  return (state, dispatch) => {
    const childRdfaIds = findRdfaIdsInSelection(state.selection);
    if (childRdfaIds.size !== 0) {
      if (dispatch) {
        console.error('Cannot wrap child rdfa nodes in a literal node');
      }
      return false;
    }

    if (dispatch) {
      const objectId = uuidv4();
      const wrapStatus = wrapIncludingParents(
        state.schema.nodes['block_rdfa'],
        {
          __rdfaId: objectId,
          rdfaNodeType: 'literal',
        },
      )(state, dispatch);

      return wrapStatus;
    }
    return true;
  };
}
