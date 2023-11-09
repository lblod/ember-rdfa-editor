import { addProperty } from './add-property';
import { Command } from 'prosemirror-state';
import { wrapIn } from 'prosemirror-commands';
import { v4 as uuidv4 } from 'uuid';
import {
  findNodeByRdfaId,
  getChildLiterals,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';

export function wrapResource({ uriBase }: { uriBase: string }): Command {
  return (state, dispatch) => {
    const attrs = {
      __rdfaId: 'placeholder',
      rdfaNodeType: 'resource',
      resource: 'another placeholder',
    };
    const wrapArgs: Parameters<typeof wrapIn> = [
      state.schema.nodes.block_rdfa,
      attrs,
    ];
    if (!wrapIn(...wrapArgs)(state)) {
      return false;
    }
    if (dispatch) {
      const objectId = uuidv4();
      const wrappingResource = `${uriBase}${uuidv4()}`;
      attrs.__rdfaId = objectId;
      attrs.resource = wrappingResource;

      const wrapStatus = wrapIn(...wrapArgs)(state, (tr) => {
        // pass the state after this transaction to addProperty so the node exists
        let newState = state.apply(tr);
        const createdWrappingNode = findNodeByRdfaId(newState.doc, objectId);

        if (!createdWrappingNode) {
          throw new Error('Unable to find node we just wrapped with');
        }
        const childLiterals = getChildLiterals(createdWrappingNode.value);
        let currentTransaction = tr;
        let addPropStatus = false;
        childLiterals.forEach((child) => {
          const addCmd = addProperty({
            resource: wrappingResource,
            property: {
              type: 'external',
              predicate: child.predicate,
              object: child.object,
            },
            transaction: currentTransaction,
          });
          addPropStatus = addCmd(newState, (transaction) => {
            // Use state, not newState to avoid re-applying transaction steps as each transaction is
            // built from the last, so includes all steps
            newState = state.apply(transaction);
            currentTransaction = transaction;
          });
        });
        dispatch(currentTransaction);

        return addPropStatus;
      });

      return wrapStatus;
    }
    return true;
  };
}
