import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelTreeWalker, {toFilterSkipFalse} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

export default class ModelRangeUtils {
  static getExtendedToPlaceholder(range: ModelRange): ModelRange {

    const copyRange = range.clone();

    if (ModelNodeUtils.isPlaceHolder(copyRange.start.parent)) {
      copyRange.start = ModelPosition.fromBeforeNode(copyRange.start.parent);
    }
    if (ModelNodeUtils.isPlaceHolder(copyRange.end.parent)) {
      copyRange.end = ModelPosition.fromAfterNode(copyRange.end.parent);
    }
    return copyRange;
  }

  static findLastNode(range: ModelRange, predicate: (node: ModelNode) => boolean): ModelNode | null {
    const treeWalker = new ModelTreeWalker({
      filter: toFilterSkipFalse(predicate),
      range: range
    });

    const nodes = [...treeWalker];
    return nodes.length > 0 ? nodes[nodes.length - 1] : null;
  }

  static findLastTextRelatedNode(range: ModelRange): ModelNode | null {
    return this.findLastNode(range, ModelNodeUtils.isTextRelated);
  }

  static findLastListElement(list: ModelElement): ModelElement | null {
    const range = ModelRange.fromAroundNode(list);
    const lastLi = this.findLastNode(range, ModelNodeUtils.isListElement);

    if (!lastLi) {
      return null;
    }

    if (!ModelNodeUtils.isListElement(lastLi)) {
      throw new Error("Found node is not a list element");
    }

    return lastLi;
  }
}
