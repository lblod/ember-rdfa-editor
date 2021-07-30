import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {isElement, isTextNode, tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {ModelError, NotImplementedError, ParseError} from "@lblod/ember-rdfa-editor/utils/errors";
import {HIGHLIGHT_ATTRIBUTE, TEXT_PROPERTY_NODES} from "@lblod/ember-rdfa-editor/model/util/constants";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

/**
 * Reader to convert a {@link Selection} to a {@link ModelSelection}.
 */
export default class SelectionReader implements Reader<Selection, ModelSelection, void> {
  private model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  read(from: Selection): ModelSelection {
    const ranges = [];
    const result = new ModelSelection();

    for (let i = 0; i < from.rangeCount; i++) {
      const range = from.getRangeAt(i);
      const modelRange = this.readDomRange(range);
      if (modelRange) {
        ranges.push(modelRange);
      }
    }
    result.ranges = ranges;
    result.isRightToLeft = SelectionReader.isReverseSelection(from);

    return result;
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
   * Convert a DOM position to a {@link ModelPosition}.
   * Can be null when the {@link Selection} is empty.
   * @param container
   * @param domOffset
   */
  readDomPosition(container: Node, domOffset: number): ModelPosition | null {
    try {
      return this.readDomPositionUnsafe(container, domOffset);
    } catch (e) {
      if (e instanceof ModelError) {
        console.warn(e.message);
        return null;
      } else {
        throw e;
      }
    }
  }

  private readDomPositionUnsafe(container: Node, domOffset: number): ModelPosition | null {
    let result = null;
    if (SelectionReader.isTextPropertyNode(container)) {
      return this.findPositionForTextPropertyNode(container, domOffset);
    } else if (isElement(container)) {
      const modelContainer = this.model.getModelNodeFor(container) as ModelElement;
      const finalOffset = modelContainer.indexToOffset(domOffset);
      result = ModelPosition.fromInElement(modelContainer, finalOffset);
    } else if (isTextNode(container)) {
      const modelTextNode = this.model.getModelNodeFor(container) as ModelText;
      const modelContainer = modelTextNode.parent;
      if (!modelContainer) {
        throw new ParseError("Text node without parent node");
      }

      const basePath = modelContainer.getOffsetPath();

      const finalOffset = modelTextNode.getOffset() + domOffset;
      basePath.push(finalOffset);
      result = ModelPosition.fromPath(modelContainer.root, basePath);
    }

    return result;
  }

  private static isTextPropertyNode(elem: Node): boolean {
    if (!isElement(elem)) {
      return false;
    }
    if (!TEXT_PROPERTY_NODES.has(tagName(elem))) {
      return false;
    }
    if (tagName(elem) === "span" && !elem.getAttribute(HIGHLIGHT_ATTRIBUTE)) {
      return false;
    }
    return true;
  }

  private findPositionForTextPropertyNode(container: Node, domOffset: number): ModelPosition {
    const walker = document.createTreeWalker(this.model.rootNode, NodeFilter.SHOW_TEXT);
    walker.currentNode = container;

    let resultingNode;
    if (container.childNodes.length === 0) {
      resultingNode = walker.previousNode();
    } else if (domOffset < container.childNodes.length) {
      resultingNode = walker.firstChild();
      if (!resultingNode) {
        resultingNode = walker.previousNode();
      }
    } else {
      resultingNode = walker.lastChild();
      if (!resultingNode) {
        resultingNode = walker.previousNode();
      }
    }

    if (!resultingNode) {
      throw new NotImplementedError();
    }

    const modelNode = this.model.getModelNodeFor(resultingNode) as ModelText;
    return ModelPosition.fromInTextNode(modelNode, modelNode.length);
  }

  /**
   * Check if selection is backwards (aka right-to-left).
   * Taken from the internet.
   * @param selection
   * @private
   */
  private static isReverseSelection(selection: Selection): boolean {
    if (!selection.anchorNode || !selection.focusNode) return false;
    const position = selection.anchorNode.compareDocumentPosition(selection.focusNode);

    // Position == 0 if nodes are the same.
    return !position && selection.anchorOffset > selection.focusOffset
      || position === Node.DOCUMENT_POSITION_PRECEDING;
  }
}
