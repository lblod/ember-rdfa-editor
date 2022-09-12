import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import ModelTreeWalker, {
  toFilterSkipFalse,
} from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import ModelNode from '@lblod/ember-rdfa-editor/model/nodes/model-node';
import ModelPositionUtils from './model-position-utils';

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

  static findModelNodes(
    range: ModelRange,
    predicate: (node: ModelNode) => boolean,
    wrapStart = true,
    descend = true
  ): ModelTreeWalker<ModelNode> {
    if (wrapStart) {
      // The start of the selected range is inside an element satisfying the predicate.
      // In this case, place the start position of the range before this element,
      // otherwise the tree walker won't include it in it's search.
      //
      // Example: predicate === (node) => ModelNode.isModelElement(node) && node.type === "li";
      //
      // BEFORE:
      // <ul>
      //  <li>list |element one</li>
      //  <li>list element |two</li>
      // </ul>
      //
      // AFTER:
      // <ul>
      //  |<li>list element one</li>
      //  <li>list element |two</li>
      // </ul>
      const startAncestors = range.start.findAncestors(predicate);

      // Select first ancestor.
      if (startAncestors.length > 0) {
        range = new ModelRange(
          ModelPosition.fromBeforeNode(startAncestors[0]),
          range.end
        );
      }
    }

    return new ModelTreeWalker({
      filter: toFilterSkipFalse(predicate),
      range: range,
      descend,
    });
  }

  static isValid(range: ModelRange) {
    return (
      ModelPositionUtils.isValid(range.start) &&
      ModelPositionUtils.isValid(range.end)
    );
  }
}
