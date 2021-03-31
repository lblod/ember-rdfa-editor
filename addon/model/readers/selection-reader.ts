import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {isElement, isTextNode, tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";
import {TEXT_PROPERTY_NODES} from "@lblod/ember-rdfa-editor/model/util/constants";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

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
   * @param domOffset
   */
  readDomPosition(container: Node, domOffset: number): ModelPosition | null {
    let rslt = null;
    if(TEXT_PROPERTY_NODES.has(tagName(container))) {
      return this.findPositionForTextPopertyNode(container, domOffset);
    }

    else if(isElement(container)) {
      const modelContainer = this.model.getModelNodeFor(container) as ModelElement;
      const basePath = modelContainer.getOffsetPath();

      const finalOffset = modelContainer.indexToOffset(domOffset);
      basePath.push(finalOffset);
      rslt = ModelPosition.fromPath(modelContainer.root, basePath);


    } else if (isTextNode(container)) {
      const modelTextNode = this.model.getModelNodeFor(container) as ModelText;
      const modelContainer = modelTextNode.parent!;
      const basePath = modelContainer.getOffsetPath();

      const finalOffset = modelTextNode.getOffset() + domOffset;
      basePath.push(finalOffset);
      rslt = ModelPosition.fromPath(modelContainer.root, basePath);

    }
    return rslt;
  }
  private findPositionForTextPopertyNode(container: Node, domOffset: number): ModelPosition {
    if(container.childNodes.length === 0) {
      // this is fallback behavior in case the dom does something really weird
      // in theory this should never happen
      throw new NotImplementedError();
    }
    let child: ChildNode | null = null;
    if(domOffset < container.childNodes.length) {
      //try to find the first child textnode to the right
      child = container.childNodes[domOffset];
      while (child && TEXT_PROPERTY_NODES.has(tagName(child))) {
        child = child.firstChild;
      }
      if(!child) {
        throw new NotImplementedError("Unforeseen dom state");
      }

    } else {
      //try to find the first child textnode to the left
      child = container.childNodes[domOffset - 1];
      while (child && TEXT_PROPERTY_NODES.has(tagName(child))) {
        child = child.lastChild;
      }
      if(!child) {
        throw new NotImplementedError("Unforeseen dom state");
      }

    }

    const modelNode = this.model.getModelNodeFor(child);
    const basePath = modelNode.getOffsetPath();
    basePath.push(0);
    return ModelPosition.fromPath(this.model.rootModelNode, basePath);


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
