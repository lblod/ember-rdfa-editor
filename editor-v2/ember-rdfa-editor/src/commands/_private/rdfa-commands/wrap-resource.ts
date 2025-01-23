import { addProperty } from '../../rdfa-commands/add-property';
import type { Command } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';
import { wrapIncludingParents } from '#root/commands';
import {
  findNodeByRdfaId,
  generateNewUri,
  getRdfaChildren,
} from '#root/utils/rdfa-utils';
import type { LinkTriple } from '#root/core/rdfa-processor';

export function wrapResource(
  args: { uriBase: string } | { existingUri: string },
): Command {
  return (state, dispatch) => {
    const attrs = {
      __rdfaId: 'placeholder',
      rdfaNodeType: 'resource',
      subject: 'another placeholder',
    };
    const wrapArgs: Parameters<typeof wrapIncludingParents> = [
      state.schema.nodes['block_rdfa'],
      attrs,
    ];
    if (!wrapIncludingParents(...wrapArgs)(state)) {
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

      const wrapStatus = wrapIncludingParents(...wrapArgs)(state, (tr) => {
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
        childLiterals.forEach((child: LinkTriple) => {
          const triple: LinkTriple = {
            ...child,
          };
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
