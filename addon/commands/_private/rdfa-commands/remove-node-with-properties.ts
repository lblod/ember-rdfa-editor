import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { Command, EditorState, Transaction } from 'prosemirror-state';
import { PNode } from '@lblod/ember-rdfa-editor';
import {
  getNodeByRdfaId,
  getNodesByResource,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getBacklinks,
  getProperties,
  getRdfaId,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/_private/rdfa-utils';
import { removeProperty } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/remove-property';
import { removeBacklinkFromResource } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/remove-resource-backlink';
import { removeBacklinkFromLiteral } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/remove-literal-backlink';

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
  const resourceNodes = resource
    ? getNodesByResource(newState, resource)
    : undefined;

  // Only remove properties from a resource node if it is the only node defining the resource
  if (resource && resourceNodes?.length === 1) {
    const properties = getProperties(resolvedNode.value) ?? [];

    properties.forEach((_property, index) => {
      const removePropertyCommand = removeProperty({
        resource,
        // Remove properties in reverse order to avoid index shifting
        index: properties.length - index - 1,
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

  // Remove backlinks from a literal node, or from the last resource node
  if (!resource || (resource && resourceNodes?.length === 1)) {
    const backlinks = getBacklinks(resolvedNode.value) ?? [];

    backlinks.forEach((_backlink, index) => {
      const removeBacklinkCommand = resource
        ? removeBacklinkFromResource({
            resource,
            // Remove properties in reverse order to avoid index shifting
            index: backlinks.length - index - 1,
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
  }

  return { currentTransaction, removeRelationshipStatus, newState };
}

type RemoveNodeWithChildNodeArgs = {
  nodes: ResolvedPNode[];
  /**
   A transaction to use in place of getting a new one from state.tr
   This can be used to call this command from within another, but care must be taken to not use
   the passed transaction between passing it in and when the callback is called.
   */
  transaction?: Transaction;
  /**
   * Should the command also delete the node from the document
   * `true` by default
   */
  deleteRange?: boolean;
};

export function removeRdfaNodesWithProperties({
  nodes,
  deleteRange = true,
  transaction,
}: RemoveNodeWithChildNodeArgs): Command {
  return (state, dispatch) => {
    const tr = transaction ?? state.tr;

    let newState = state.apply(tr);
    let currentTransaction = tr;
    let removeRelationshipStatus = false;

    nodes.forEach((node) => {
      const childNodes = findAllRdfaNodeChildren(node.value, state);

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

      // properties of the initial "parent" will most likely change as we update child node
      // so we need to re-resolve the node
      const newStateNode = newState.doc.resolve(node.pos).nodeAfter;

      if (newStateNode) {
        const removeNodePropertiesResult = removeNodeProperties({
          resolvedNode: {
            value: newStateNode,
            pos: node.pos,
          },
          currentTransaction,
          state,
          newState,
          removeRelationshipStatus,
        });

        currentTransaction = removeNodePropertiesResult.currentTransaction;
        removeRelationshipStatus =
          removeNodePropertiesResult.removeRelationshipStatus;
        newState = removeNodePropertiesResult.newState;
      }

      if (deleteRange) {
        currentTransaction = currentTransaction.deleteRange(
          node.pos,
          node.pos + node.value.nodeSize,
        );
      }
    });

    if (dispatch) {
      dispatch(currentTransaction);
    }

    return removeRelationshipStatus;
  };
}
