import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelTreeWalker, {toFilterSkipFalse} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {TypeAssertionError} from "@lblod/ember-rdfa-editor/utils/errors";

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
    if (range.start.parentOffset === range.end.parentOffset) {
      return null;
    }

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

  static findLastListElement(range: ModelRange): ModelElement | null {
    const lastListElement = this.findLastNode(range, ModelNodeUtils.isListElement);

    if (!lastListElement) {
      return null;
    }

    if (!ModelNodeUtils.isListElement(lastListElement)) {
      throw new TypeAssertionError("Found node is not a list element");
    }

    return lastListElement;
  }

  static findLastTableCell(range: ModelRange): ModelElement | null {
    const lastTableCell = this.findLastNode(range, ModelNodeUtils.isTableCell);

    if (!lastTableCell) {
      return null;
    }

    if (!ModelNodeUtils.isTableCell(lastTableCell)) {
      throw new TypeAssertionError("Found node is not a list element");
    }

    return lastTableCell;
  }

  static findModelNodes(range: ModelRange, predicate: (node: ModelNode) => boolean, wrapStart = true): ModelTreeWalker<ModelNode> {
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
        range = new ModelRange(ModelPosition.fromBeforeNode(startAncestors[0]), range.end);
      }
    }

    return new ModelTreeWalker({
      filter: toFilterSkipFalse(predicate),
      range: range
    });
  }
}
