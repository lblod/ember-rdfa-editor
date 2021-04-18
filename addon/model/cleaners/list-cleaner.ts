import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelTreeWalker, {toFilterSkipFalse} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";

export default class ListCleaner {
  clean(range: ModelRange) {

    const listNodes = new ModelTreeWalker<ModelElement>({
      filter: toFilterSkipFalse(ModelNodeUtils.isListContainer),
      range
    });

    for (const listNode of listNodes) {
      const next = listNode.nextSibling;
      if (next
        && ModelNodeUtils.isListContainer(next)
        && ModelNodeUtils.areAttributeMapsSame(listNode.attributeMap, next.attributeMap)) {
        ListCleaner.mergeListNodes(listNode, next);
      }
    }

  }

  private static mergeListNodes(node1: ModelElement, node2: ModelElement) {
    node2.insertChildrenAtOffset(0, ...node1.children);
    node1.remove();
  }
}
