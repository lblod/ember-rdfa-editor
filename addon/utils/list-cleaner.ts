import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import ModelPosition from '../core/model/model-position';
import GenTreeWalker from './gen-tree-walker';

export default class ListCleaner {
  clean(range: ModelRange, tr: Transaction) {
    let mappedRange = tr.mapModelRange(range);
    // SAFETY: listcontainers are always elements
    let nodes = this.getNextMergeableListNodes(tr, mappedRange);
    while (nodes) {
      const { first, second } = nodes;
      ListCleaner.mergeListNodes(first, second, tr);
      mappedRange = tr.mapModelRange(mappedRange);
      nodes = this.getNextMergeableListNodes(tr, mappedRange);
    }
  }

  getNextMergeableListNodes(
    tr: Transaction,
    range: ModelRange
  ): { first: ModelElement; second: ModelElement } | undefined {
    const generator = GenTreeWalker.fromRange({
      filter: toFilterSkipFalse((node) => ModelNodeUtils.isListContainer(node)),
      range,
    }).nodes() as Generator<ModelElement>;
    for (const listNode of generator) {
      const next = listNode.getNextSibling(tr.currentDocument);
      if (
        next &&
        ModelNodeUtils.isListContainer(next) &&
        ModelNodeUtils.areAttributeMapsSame(
          listNode.attributeMap,
          next.attributeMap
        )
      ) {
        return { first: listNode, second: next };
      }
    }
    return;
  }

  private static mergeListNodes(
    node1: ModelElement,
    node2: ModelElement,
    tr: Transaction
  ) {
    const positionToInsert = ModelPosition.fromInElement(
      tr.currentDocument,
      node2,
      0
    );
    tr.insertAtPosition(positionToInsert, ...node1.children);
    tr.deleteNode(node1);
  }
}
