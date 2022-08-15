import Transaction from '@lblod/ember-rdfa-editor/core/transaction';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import ModelPosition from '../model-position';
import GenTreeWalker from '../util/gen-tree-walker';

export default class ListCleaner {
  clean(range: ModelRange, tr: Transaction) {
    tr.deepClone();
    const clonedRange = tr.cloneRange(range);
    // SAFETY: listcontainers are always elements
    const listNodes = GenTreeWalker.fromRange({
      filter: toFilterSkipFalse((node) => ModelNodeUtils.isListContainer(node)),
      range: clonedRange,
    }).nodes() as Generator<ModelElement>;

    for (const listNode of listNodes) {
      const next = listNode.nextSibling;
      if (
        next &&
        ModelNodeUtils.isListContainer(next) &&
        ModelNodeUtils.areAttributeMapsSame(
          listNode.attributeMap,
          next.attributeMap
        )
      ) {
        ListCleaner.mergeListNodes(listNode, next, tr);
      }
    }
  }

  private static mergeListNodes(
    node1: ModelElement,
    node2: ModelElement,
    tr: Transaction
  ) {
    const positionToInsert = ModelPosition.fromInElement(node2, 0);
    tr.insertAtPosition(positionToInsert, ...node1.children);
    tr.deleteNode(node1);
  }
}
