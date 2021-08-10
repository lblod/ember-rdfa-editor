import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";

export default class ModelPositionUtils {
  static isInLumpNode(position: ModelPosition) {
    const lumpNodeAncestors = position.findAncestors(ModelNodeUtils.isLumpNode);
    return lumpNodeAncestors.length > 0;
  }
}
