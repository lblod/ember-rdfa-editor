import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {isTextNode, tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

/**
 * Reader to convert a {@link Selection} to a {@link ModelSelection}
 */
export default class SelectionReader implements Reader<Selection, ModelSelection> {
  constructor(private model: Model) {
  }

  read(from: Selection): ModelSelection {
    const ranges = [];

    const rslt = new ModelSelection(this.model);

    for (let i = 0; i < from.rangeCount; i++) {
      const range = from.getRangeAt(i);
      const modelRange = this.readDomRange(range);
      if (modelRange) {
        ranges.push(modelRange);
      }
    }
    rslt.ranges = ranges;
    rslt.isRightToLeft = this.isReverseSelection(from);
    console.log("GENERATING", rslt);
    return rslt;
  }

  /**
   * Convert a {@link Range} to a {@link ModelRange}.
   * Can be null when the {@link Selection} is empty.
   * @param range
   */
  readDomRange(range: Range): ModelRange | null {
    const start = this.readDomPosition(range.startContainer, range.startOffset);
    if (!start) {
      return null;
    }
    if (range.collapsed) {
      return new ModelRange(start);
    }
    const end = this.readDomPosition(range.endContainer, range.endOffset);
    return new ModelRange(start, end ?? start);
  }

  /**
   * Convert a DOM position to a {@link ModelPosition}
   * Can be null when the {@link Selection} is empty.
   * @param container
   * @param offset
   */
  readDomPosition(container: Node, offset: number): ModelPosition | null {
    const {container: normalizedContainer, offset: normalizedOffset} = this.normalizeDomPosition(container, offset);
    const modelNode = this.model.getModelNodeFor(normalizedContainer);
    const root = this.model.rootModelNode;
    if (!modelNode) {
      return null;
    }
    return ModelPosition.fromParent(root, modelNode, normalizedOffset);
  }

  /**
   * Things are easier to work with if we use textnodes as parents as much as possible. This tries
   * to convert a dom position anchored to an element into an equivalent position anchored to a textnode, but in
   * a conservative way.
   * @param container
   * @param offset
   * @private
   */
  private normalizeDomPosition(container: Node, offset: number): { container: Node, offset: number } {
    if (isTextNode(container)) {
      return {container, offset};
    }
    // try to find a textnode to the left
    if (offset > 0) {
      let leftNode: ChildNode | null = container.childNodes[offset - 1];
      // ignore breaks to the left
      // TODO: what about other block elements? Do we actually want to do this here, or should we expect
      // commands to handle breaks themselves?
      while (leftNode && tagName(leftNode) === "br") {
        leftNode = leftNode.previousSibling;
      }

      if (leftNode) {
        if (isTextNode(leftNode)) {
          return {container: leftNode, offset: leftNode.length};
        }
        else if (leftNode.childNodes.length > 0) {
          return this.normalizeDomPosition(leftNode, leftNode.childNodes.length);
        }
        else {
          return {container, offset};
        }
      }
    }

    // try to find a textnode to the right
    // Note we don't skip breaks here, this is only because that currently doesn't seem necessary
    const rightNode = container.childNodes[offset];

    if(rightNode){
      if (isTextNode(rightNode)) {
        return {container: rightNode, offset: 0};
      }
      else if (rightNode.childNodes.length > 0) {
        return this.normalizeDomPosition(rightNode, 0);
      } else {
        return {container, offset};
      }
    }
    return {container, offset};
  }

  /**
   * Check if selection is backwards (aka right-to-left)
   * Taken from the internet
   * @param selection
   * @private
   */
  private isReverseSelection(selection: Selection): boolean {
    if (!selection.anchorNode || !selection.focusNode) return false;
    const position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
    let backward = false;
    // position == 0 if nodes are the same
    if (!position && selection.anchorOffset > selection.focusOffset || position === Node.DOCUMENT_POSITION_PRECEDING) {
      backward = true;
    }
    return backward;
  }
}
