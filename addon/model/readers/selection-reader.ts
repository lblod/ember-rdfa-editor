import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

export default class SelectionReader implements Reader<Selection, ModelSelection> {
  constructor(private model: Model) {
  }

  read(from: Selection): ModelSelection {
    const ranges = [];

    const rslt = new ModelSelection(this.model);

    for (let i = 0; i < from.rangeCount; i++) {
      const range = from.getRangeAt(i);
      ranges.push(this.readDomRange(range));
    }
    rslt.ranges = ranges;
    rslt.isRightToLeft = this.isReverseSelection(from);
    return rslt;
  }

  readDomRange(range: Range): ModelRange {
    const start = this.readDomPosition(range.startContainer, range.startOffset);
    if (range.collapsed) {
      return new ModelRange(start);
    }
    const end = this.readDomPosition(range.endContainer, range.endOffset);
    return new ModelRange(end);
  }

  readDomPosition(container: Node, offset: number): ModelPosition {
    const modelNode = this.model.getModelNodeFor(container);
    const root = this.model.rootModelNode;
    if (!modelNode) {
      throw new SelectionError("Selected node without modelNode equivalent");
    }
    return ModelPosition.fromParent(root, modelNode, offset);
  }

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
