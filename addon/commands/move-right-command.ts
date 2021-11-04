import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {MisbehavedSelectionError, TypeAssertionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";

export default class MoveRightCommand extends Command {
  name = "move-right";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    return range.collapsed;
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const rangeStart = MoveRightCommand.skipInvisibleSpaces(range.start);
    const nodeAfter = rangeStart.nodeAfter();

    let newStart: ModelPosition;
    if (nodeAfter) {
      if (ModelNodeUtils.isTextRelated(nodeAfter)) {
        if (ModelNode.isModelText(nodeAfter)) {
          // Move the cursor one place to the right, since there is a character right behind it.
          newStart = MoveRightCommand.getShiftedPosition(rangeStart);
        } else {
          // Move the cursor after the "br" that is after it.
          newStart = ModelPosition.fromAfterNode(nodeAfter);
        }
      } else {
        // We search for the previous suitable position before the cursor.
        // This can either be the position right after a text related node or the position
        // right at the start of a list element or table cell.
        const newPosition = this.findNextSuitablePosition(rangeStart);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
    } else {
      let searchStart: ModelPosition;
      const currentElement = rangeStart.parent;
      // If the current element is either a list element or table cell, we starting searching from after
      // this element.
      if (ModelNodeUtils.isListElement(currentElement) || ModelNodeUtils.isTableCell(currentElement)) {
        searchStart = ModelPosition.fromAfterNode(currentElement);
      } else {
        searchStart = rangeStart;
      }

      // We search for the previous suitable position before the cursor.
      // This can either be the position right after a text related node or the position
      // right at the start of a list element or table cell.
      const newPosition = this.findNextSuitablePosition(searchStart);
      if (!newPosition) {
        return;
      }

      newStart = newPosition;
    }

    const newRange = new ModelRange(newStart);
    this.model.change(_ => this.model.selectRange(newRange));
  }

  private findNextSuitablePosition(startPosition: ModelPosition): ModelPosition | null {
    // We search the whole document after the given position.
    const searchRange = new ModelRange(
      startPosition,
      ModelPosition.fromInNode(this.model.rootModelNode, this.model.rootModelNode.getMaxOffset())
    );

    // We search for the first text related node, list element or table cell.
    const nextSuitableNode = ModelRangeUtils.findFirstNode(
      searchRange,
      node => {
        return ModelNodeUtils.isTextRelated(node)
          || ModelNodeUtils.isListElement(node)
          || ModelNodeUtils.isTableCell(node);
      }
    );

    // If no suitable node is found, we do not update the position.
    if (!nextSuitableNode) {
      return null;
    }

    if (ModelNodeUtils.isTextRelated(nextSuitableNode)) {
      // In case a text related node is found, we place the cursor right before it.
      return ModelPosition.fromBeforeNode(nextSuitableNode);
    } else if (ModelNodeUtils.isListElement(nextSuitableNode) || ModelNodeUtils.isTableCell(nextSuitableNode)) {
      // In case a list element or table cell is found, we place the cursor at the start of it.
      return ModelPosition.fromInNode(nextSuitableNode, 0);
    }

    throw new TypeAssertionError("Found node is not text related, a list element or a table cell");
  }

  private static skipInvisibleSpaces(start: ModelPosition): ModelPosition {
    let position = start;
    while (position.charactersAfter(1) === INVISIBLE_SPACE) {
      position = MoveRightCommand.getShiftedPosition(position);
    }

    return position;
  }

  private static getShiftedPosition(position: ModelPosition): ModelPosition {
    const shiftedPosition = position.clone();
    shiftedPosition.parentOffset++;

    return shiftedPosition;
  }
}
