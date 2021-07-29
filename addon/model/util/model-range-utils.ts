import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";

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
}
