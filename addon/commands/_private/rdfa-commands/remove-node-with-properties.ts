import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { Command, EditorState, Transaction } from 'prosemirror-state';
import { PNode } from '@lblod/ember-rdfa-editor';
import { getNodeByRdfaId } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getBacklinks,
  getProperties,
  getRdfaId,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/_private/rdfa-utils';
import { removeProperty } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/remove-property';
import { removeBacklinkFromResource } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/remove-resource-backlink';
import { removeBacklinkFromLiteral } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/remove-literal-backlink';

const commandWrapper: Command = (state, dispatch) => {
  const tr = state.tr;

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};
const findAllRdfaNodeChildren = (node: PNode, state: EditorState) => {
  const resolvedChildrenPositions: ResolvedPNode[] = [];

  node.forEach((child) => {
    if (child.type.spec.attrs?.['rdfaNodeType']) {
      const resolvedPNode = getNodeByRdfaId(state, child.attrs?.['__rdfaId']);

      if (resolvedPNode) {
        resolvedChildrenPositions.push(resolvedPNode);
      }

      resolvedChildrenPositions.push(...findAllRdfaNodeChildren(child, state));
    }
  });

  return resolvedChildrenPositions;
};

function removeNodeProperties({
  resolvedNode,
  currentTransaction,
  state,
  newState,
  removeRelationshipStatus,
}: {
  resolvedNode: ResolvedPNode;
  currentTransaction: Transaction;
  state: EditorState;
  newState: EditorState;
  removeRelationshipStatus: boolean;
}) {
  const resource = getResource(resolvedNode.value);

  if (resource) {
    const properties = getProperties(resolvedNode.value) ?? [];

    properties.forEach((_property, index) => {
      const removePropertyCommand = removeProperty({
        resource,
        index,
        transaction: currentTransaction,
      });

      removeRelationshipStatus = removePropertyCommand(
        newState,
        (transaction) => {
          // Use state, not newState to avoid re-applying transaction steps as each transaction is
          // built from the last, so includes all steps
          newState = state.apply(transaction);
          currentTransaction = transaction;
        },
      );
    });
  }

  const backlinks = getBacklinks(resolvedNode.value) ?? [];

  backlinks.forEach((_backlink, index) => {
    const removeBacklinkCommand = resource
      ? removeBacklinkFromResource({
          resource,
          index,
          transaction: currentTransaction,
        })
      : removeBacklinkFromLiteral({
          rdfaId: getRdfaId(resolvedNode.value) as string,
          transaction: currentTransaction,
        });

    removeRelationshipStatus = removeBacklinkCommand(
      newState,
      (transaction) => {
        // Use state, not newState to avoid re-applying transaction steps as each transaction is
        // built from the last, so includes all steps
        newState = state.apply(transaction);
        currentTransaction = transaction;
      },
    );
  });

  return { currentTransaction, removeRelationshipStatus, newState };
}

export function removeNodeWithChildNodes(node: ResolvedPNode): Command {
  return (state, dispatch) => {
    const childNodes = findAllRdfaNodeChildren(node.value, state);

    return commandWrapper(state, (tr) => {
      let newState = state.apply(tr);

      let currentTransaction = tr;
      let removeRelationshipStatus = false;

      childNodes.forEach((child) => {
        const removeNodePropertiesResult = removeNodeProperties({
          resolvedNode: child,
          currentTransaction,
          state,
          newState,
          removeRelationshipStatus,
        });

        currentTransaction = removeNodePropertiesResult.currentTransaction;
        removeRelationshipStatus =
          removeNodePropertiesResult.removeRelationshipStatus;
        newState = removeNodePropertiesResult.newState;
      });

      const removeNodePropertiesResult = removeNodeProperties({
        resolvedNode: node,
        currentTransaction,
        state,
        newState,
        removeRelationshipStatus,
      });

      currentTransaction = removeNodePropertiesResult.currentTransaction;
      removeRelationshipStatus =
        removeNodePropertiesResult.removeRelationshipStatus;
      newState = removeNodePropertiesResult.newState;

      currentTransaction = currentTransaction.deleteRange(
        node.pos,
        node.pos + node.value.nodeSize,
      );

      if (dispatch) {
        dispatch(currentTransaction);
      }

      return removeRelationshipStatus;
    });
  };
}
