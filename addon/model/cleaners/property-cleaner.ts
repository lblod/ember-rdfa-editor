import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelTreeWalker, {
  toFilterSkipFalse,
} from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';

export default class PropertyCleaner {
  clean(range: ModelRange) {
    const textNodes = new ModelTreeWalker<ModelText>({
      range,
      filter: toFilterSkipFalse(ModelNode.isModelText),
    });
    // careful, we are modifying the nodes in the iterator inside the loop
    // this only works because we are going left to right and merging the left
    // node into the right one
    for (const node of textNodes) {
      const next = node.nextSibling;
      if (ModelNode.isModelText(next)) {
        if (
          ModelNodeUtils.areAttributeMapsSame(
            node.attributeMap,
            next.attributeMap
          )
        ) {
          this.mergeTextNodes(node, next);
          node.remove();
        }
      }
    }
  }

  // TODO maybe this should be done with an operation
  private mergeTextNodes(toMerge: ModelText, target: ModelText) {
    target.content = toMerge.content + target.content;
  }
}
