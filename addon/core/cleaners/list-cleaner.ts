import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelTreeWalker, {toFilterSkipFalse} from "@lblod/ember-rdfa-editor/util/model-tree-walker";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/util/model-node-utils";
import {Mutator} from "@lblod/ember-rdfa-editor/core/mutator";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";

export default class ListCleaner {
  clean(range: ModelRange, mutator: Mutator) {
    const listNodes = new ModelTreeWalker<ModelElement>({
      filter: toFilterSkipFalse(ModelNodeUtils.isListContainer),
      range
    });

    for (const listNode of listNodes) {
      const next = listNode.nextSibling;
      if (next
        && ModelNodeUtils.isListContainer(next)
        && ModelNodeUtils.areAttributeMapsSame(listNode.attributeMap, next.attributeMap)) {
        ListCleaner.mergeListNodes(listNode, next, mutator);
      }
    }
  }

  private static mergeListNodes(node1: ModelElement, node2: ModelElement, mutator: Mutator) {
    const positionToInsert = ModelPosition.fromInElement(node2, 0);
    mutator.insertAtPosition(positionToInsert, ...node1.children);
    mutator.deleteNode(node1);
  }
}
