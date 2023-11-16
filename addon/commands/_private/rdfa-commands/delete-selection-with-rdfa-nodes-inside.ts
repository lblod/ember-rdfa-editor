import { Command, Selection } from 'prosemirror-state';

import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

import { removeRdfaNodesWithProperties } from './remove-node-with-properties';

const nodeFallsCompletelyInsideSelection = (
  node: ResolvedPNode,
  selection: Selection,
) =>
  node.pos >= selection.from && node.pos + node.value.nodeSize <= selection.to;

export const deleteSelectionWithRdfaNodesInside: Command = (
  state,
  dispatch,
) => {
  if (!dispatch) {
    return false;
  }

  const nodesCompletelyInsideSelections: ResolvedPNode[] = [];

  const { $from, $to } = state.selection;

  state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
    if (
      node.attrs.rdfaNodeType &&
      nodeFallsCompletelyInsideSelection({ value: node, pos }, state.selection)
    ) {
      nodesCompletelyInsideSelections.push({
        value: node,
        pos,
      });
    }
  });

  if (nodesCompletelyInsideSelections.length > 0) {
    const nodesToRemove: ResolvedPNode[] = [];

    // Detect nodes that are descendants of other nodes
    nodesCompletelyInsideSelections.forEach((node) => {
      node.value.descendants((outerNode) => {
        const descendantNode = nodesCompletelyInsideSelections.find(
          (innerNode) => innerNode.value === outerNode,
        );

        if (descendantNode) {
          nodesToRemove.push(descendantNode);
        }
      });
    });

    // Remove nodes that are descendants of other nodes
    const parentNodesCompletelyInsideSelection =
      nodesCompletelyInsideSelections.filter(
        (node) => !nodesToRemove.includes(node),
      );

    if (parentNodesCompletelyInsideSelection.length > 0) {
      const transaction = state.tr;

      const removeRdfaNodesWithPropertiesCommand =
        removeRdfaNodesWithProperties({
          nodes: parentNodesCompletelyInsideSelection,
          transaction,
          deleteRange: false,
        });

      return removeRdfaNodesWithPropertiesCommand(state, (transaction) => {
        transaction.deleteSelection();

        dispatch?.(transaction);
      });
    }
  }

  return false;
};
