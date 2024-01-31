import { Command } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';
import {
  findNodeByRdfaId,
  generateNewUri,
  getRdfaChildren,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { wrapSelection } from '../../wrap-selection';
import { addProperty } from '../../rdfa-commands/add-property';
import { LinkTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';

export function wrapInlineResource(
  args: { uriBase: string } | { existingUri: string },
): Command {
  return (state, dispatch) => {
    const attrs = {
      __rdfaId: 'placeholder',
      rdfaNodeType: 'resource',
      subject: 'another placeholder',
    };
    const wrapArgs: Parameters<typeof wrapSelection> = [
      state.schema.nodes.inline_rdfa,
      () => attrs,
    ];
    if (!wrapSelection(...wrapArgs)(state)) {
      return false;
    }
    if (dispatch) {
      if ('existingUri' in args) {
        attrs.__rdfaId = uuidv4();
        attrs.subject = args.existingUri;
      } else {
        const { __rdfaId, resource } = generateNewUri(args.uriBase);
        attrs.__rdfaId = __rdfaId;
        attrs.subject = resource;
      }

      const wrapStatus = wrapSelection(...wrapArgs)(state, (tr) => {
        // pass the state after this transaction to addProperty so the node exists
        let newState = state.apply(tr);
        const createdWrappingNode = findNodeByRdfaId(
          newState.doc,
          attrs.__rdfaId,
        );

        if (!createdWrappingNode) {
          throw new Error('Unable to find node we just wrapped with');
        }
        const childLiterals = getRdfaChildren(createdWrappingNode.value);
        let currentTransaction = tr;
        let addPropStatus = false;
        childLiterals.forEach((child) => {
          const triple: LinkTriple = { ...child };
          const addCmd = addProperty({
            resource: attrs.subject,
            property: triple,
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
