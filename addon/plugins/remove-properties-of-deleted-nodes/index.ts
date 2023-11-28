import { EditorState, Plugin } from 'prosemirror-state';
import { PNode } from '@lblod/ember-rdfa-editor';
import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/_private/node-utils';
import {
  getBacklinks,
  getProperties,
  getRdfaId,
} from '@lblod/ember-rdfa-editor/utils/_private/rdfa-utils';
import { removeBacklinksTargetingResourceProperty } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/remove-backlinks-targeting-resource-property';
import { removePropertiesTargetingBacklinks } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/remove-properties-targeting-backlinks';

/**
 * Returns nodes from the oldState that are not in the newState
 */
function getDeletedNodes(oldState: EditorState, newState: EditorState) {
  const prevNodesById: Map<string, PNode> = new Map();
  const nextNodesById: Map<string, PNode> = new Map();

  oldState.doc.descendants((node) => {
    if (node.attrs['__rdfaId']) {
      prevNodesById.set(node.attrs['__rdfaId'] as string, node);
    }
  });

  newState.doc.descendants((node) => {
    if (node.attrs['__rdfaId']) {
      nextNodesById.set(node.attrs['__rdfaId'] as string, node);
    }
  });

  // nodes that are in oldState but not in newState
  const deletedNodes = new Set<PNode>();

  prevNodesById.forEach((node, rdfaId) => {
    if (!nextNodesById.has(rdfaId)) {
      deletedNodes.add(node);
    }
  });

  return deletedNodes;
}

export function removePropertiesOfDeletedNodes() {
  return new Plugin({
    appendTransaction(transactions, oldState, newState) {
      if (!transactions.some((transaction) => transaction.docChanged)) {
        return null;
      }

      const deletedNodes = getDeletedNodes(oldState, newState);

      if (deletedNodes.size === 0) {
        return null;
      }

      const tr = newState.tr;

      let nextState = newState.apply(tr);
      let sharedTransaction = tr;

      deletedNodes.forEach((node) => {
        const isResource = isResourceNode(node);

        if (isResource) {
          const resource = node.attrs.resource as string;
          const resourceNodes = getNodesByResource(newState, resource);

          // Resource nodes of same resource still remain in the document, take no action
          if (resourceNodes && resourceNodes.length >= 1) {
            return;
          }

          const properties = getProperties(node) ?? [];

          properties.forEach((property) => {
            const removeBacklinksCommand =
              removeBacklinksTargetingResourceProperty({
                resource,
                property,
                transaction: sharedTransaction,
              });

            removeBacklinksCommand(nextState, (transaction) => {
              nextState = newState.apply(transaction);
              sharedTransaction = transaction;
            });
          });

          const backlinks = getBacklinks(node) ?? [];

          backlinks.forEach((backlink) => {
            const removePropertiesCommand = removePropertiesTargetingBacklinks({
              backlink,
              transaction: sharedTransaction,
            });

            removePropertiesCommand(nextState, (transaction) => {
              nextState = newState.apply(transaction);
              sharedTransaction = transaction;
            });
          });

          // Resource node processed, take no further action
          return;
        }

        const rdfaId = getRdfaId(node);

        if (!isResource && rdfaId) {
          const backlinks = getBacklinks(node) ?? [];

          backlinks.forEach((backlink) => {
            const removePropertiesCommand = removePropertiesTargetingBacklinks({
              backlink,
              transaction: sharedTransaction,
              rdfaId,
            });

            removePropertiesCommand(nextState, (transaction) => {
              nextState = newState.apply(transaction);
              sharedTransaction = transaction;
            });
          });
        }
      });

      return tr.steps.length ? tr : null;
    },
  });
}
