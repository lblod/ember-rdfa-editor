import Writer from "@lblod/ember-rdfa-editor/model/writers/writer";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {ModelError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";

/**
 * Writer to convert a {@link ModelSelection} to a {@link Selection}
 * Note, unlike most writers, this is not a functional writer, since we cannot (or should not)
 * create a {@link Selection}
 */
export default class SelectionWriter implements Writer<ModelSelection, void> {
  write(modelSelection: ModelSelection): void {
    const domSelection = getWindowSelection();
    domSelection.removeAllRanges();
    for (const range of modelSelection.ranges) {
      domSelection.addRange(this.writeDomRange(range));
    }

  }

  /**
   * Convert a single {@link ModelRange} to a {@link Range}
   * @param range
   */
  writeDomRange(range: ModelRange): Range {
    const rslt = document.createRange();
    const startPos = this.writeDomPosition(range.start);
    const endPos = this.writeDomPosition(range.end);
    rslt.setStart(startPos.anchor, startPos.offset);
    rslt.setEnd(endPos.anchor, endPos.offset);

    return rslt;
  }

  /**
   * Convert a single {@link ModelPosition} to a DOM position
   * (aka a {@link Node} and an offset)
   * @param position
   */
  writeDomPosition(position: ModelPosition): { anchor: Node, offset: number } {

    const nodeAfter = position.nodeAfter();
    const nodeBefore = position.nodeBefore();
    if (!nodeAfter) {
      return {anchor: position.parent.boundNode!, offset: position.parent.boundNode!.childNodes.length};
    }
    if (ModelElement.isModelText(nodeAfter)) {
      return {anchor: nodeAfter.boundNode!, offset: position.parentOffset - nodeAfter.getOffset()};

    } else if (ModelElement.isModelText(nodeBefore)) {
      // we prefer textnode anchors, so we look both ways
      return {anchor: nodeBefore.boundNode!, offset: position.parentOffset - nodeBefore.getOffset()};

    } else if (ModelElement.isModelElement(nodeAfter)) {
      const domAnchor = position.parent.boundNode!;
      const domIndex = ArrayUtils.indexOf(nodeAfter.boundNode!, (domAnchor as HTMLElement).childNodes)!;
      return {anchor: position.parent.boundNode!, offset: domIndex};
    } else {
      throw new ModelError("Unsupported nodetype");
    }

  }

}
