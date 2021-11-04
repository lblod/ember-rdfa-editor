import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {MisbehavedSelectionError, TypeAssertionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";

export default class MoveLeftCommand extends Command {
  name = "move-left";

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

    const rangeStart = MoveLeftCommand.skipInvisibleSpaces(range.start);
    const nodeBefore = rangeStart.nodeBefore();

    let newStart: ModelPosition;
    if (nodeBefore) {
      if (ModelNodeUtils.isTextRelated(nodeBefore)) {
        if (ModelNode.isModelText(nodeBefore)) {
          // Move the cursor one place to the left, since there is a character right before it.
          newStart = MoveLeftCommand.getShiftedPosition(rangeStart);
        } else {
          // Move the cursor before the "br" that is before it.
          newStart = ModelPosition.fromBeforeNode(nodeBefore);
          // Search for the last list element of this list and place the cursor at the end of it.
        }
      } else {
        // We search for the previous suitable position before the cursor.
        // This can either be the position right after a text related node or the position
        // right at the start of a list element or table cell.
        const newPosition = this.findPreviousSuitablePosition(rangeStart);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
    } else {
      let searchStart: ModelPosition;
      const currentElement = rangeStart.parent;
      // If the current element is either a list element or table cell, we starting searching from before
      // this element.
      if (ModelNodeUtils.isListElement(currentElement) || ModelNodeUtils.isTableCell(currentElement)) {
        searchStart = ModelPosition.fromBeforeNode(currentElement);
      } else {
        searchStart = rangeStart;
      }

      // We search for the previous suitable position before the cursor.
      // This can either be the position right after a text related node or the position
      // right at the start of a list element or table cell.
      const newPosition = this.findPreviousSuitablePosition(searchStart);
      if (!newPosition) {
        return;
      }

      newStart = newPosition;
    }

    const newRange = new ModelRange(newStart);
    this.model.change(_ => this.model.selectRange(newRange));
  }

  private findPreviousSuitablePosition(startPosition: ModelPosition): ModelPosition | null {
    // We search the whole document before the given position.
    const searchRange = new ModelRange(
      ModelPosition.fromInNode(this.model.rootModelNode, 0),
      startPosition
    );

    // We search for the last text related node, list element or table cell.
    const previousSuitableNode = ModelRangeUtils.findLastNode(
      searchRange,
      node => {
        return ModelNodeUtils.isTextRelated(node)
          || ModelNodeUtils.isListElement(node)
          || ModelNodeUtils.isTableCell(node);
      }
    );

    // If no suitable node is found, we do not update the position.
    if (!previousSuitableNode) {
      return null;
    }

    if (ModelNodeUtils.isTextRelated(previousSuitableNode)) {
      // In case a text related node is found, we place the cursor right behind it.
      return ModelPosition.fromAfterNode(previousSuitableNode);
    } else if (ModelNodeUtils.isListElement(previousSuitableNode)) {
      // In case a list element is found, we place the cursor right before the first nested list in this
      // element.
      const firstListContainer = previousSuitableNode.findFirstChild(ModelNodeUtils.isListContainer);
      if (firstListContainer) {
        ModelPosition.fromBeforeNode(firstListContainer);
      }

      return ModelPosition.fromInNode(previousSuitableNode, previousSuitableNode.getMaxOffset());
    } else if (ModelNodeUtils.isTableCell(previousSuitableNode)) {
      // In case a table cell is found, we place the cursor at the end of it.
      return ModelPosition.fromInNode(previousSuitableNode, previousSuitableNode.getMaxOffset());
    }

    throw new TypeAssertionError("Found node is not text related, a list element or a table cell");
  }

  private static skipInvisibleSpaces(start: ModelPosition): ModelPosition {
    let position = start;
    while (position.charactersBefore(1) === INVISIBLE_SPACE) {
      position = MoveLeftCommand.getShiftedPosition(position);
    }

    return position;
  }

  private static getShiftedPosition(position: ModelPosition): ModelPosition {
    const shiftedPosition = position.clone();
    shiftedPosition.parentOffset--;

    return shiftedPosition;
  }
}
