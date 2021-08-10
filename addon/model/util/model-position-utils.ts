import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";

export default class ModelPositionUtils {
  static findNodeBeforePosition(position: ModelPosition, predicate: (node: ModelNode) => boolean): ModelNode | null {
    let node: ModelNode | null = position.nodeBefore();
    while (node && !predicate(node)) {
      node = ModelPosition.fromBeforeNode(node).nodeBefore();
    }

    if (!node) {
      return null;
    }

    return node;
  }

  static findNodeAfterPosition(position: ModelPosition, predicate: (node: ModelNode) => boolean): ModelNode | null {
    let node: ModelNode | null = position.nodeAfter();
    while (node && !predicate(node)) {
      node = ModelPosition.fromAfterNode(node).nodeAfter();
    }

    if (!node) {
      return null;
    }

    return node;
  }

  static isInLumpNode(position: ModelPosition) {
    const lumpNodeAncestors = position.findAncestors(ModelNodeUtils.isLumpNode);
    return lumpNodeAncestors.length > 0;
  }
}
