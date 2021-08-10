import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {MisbehavedSelectionError, ModelError, TypeAssertionError} from "@lblod/ember-rdfa-editor/utils/errors";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
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
      // Move the cursor one place to the right, since there is a character right behind it.
      if (ModelNode.isModelText(nodeAfter)) {
        newStart = MoveRightCommand.getShiftedPosition(rangeStart);
      // Move the cursor after the "br" that is after it.
      } else if (ModelNodeUtils.isBr(nodeAfter)) {
        newStart = ModelPosition.fromAfterNode(nodeAfter);
      // Search for the first list element and place the cursor at the start of it.
      } else if (ModelNodeUtils.isListContainer(nodeAfter)) {
        newStart = MoveRightCommand.getPositionInFirstListElement(nodeAfter);
      // Search for the first table cell and place the cursor at the start of it.
      } else if (ModelNodeUtils.isTableContainer(nodeAfter)) {
        newStart = MoveRightCommand.getPositionInFirstTableCell(nodeAfter);
      // In all other cursor, we search for a next suitable position.
      } else {
        const newPosition = this.findNextSuitablePosition(rangeStart);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
    } else {
      const currentElement = rangeStart.parent;
      // If the cursor is at the end of a list element, we search for the next list element and place
      // the cursor right at the start of it. If there is no next list element, we search for a next suitable
      // position.
      if (ModelNodeUtils.isListElement(currentElement)) {
        const listRelatedAncestors = rangeStart.findAncestors(ModelNodeUtils.isListRelated);
        const topListContainer = listRelatedAncestors[listRelatedAncestors.length - 1];

        const positionAfterList = ModelPosition.fromAfterNode(topListContainer);
        const searchRange = new ModelRange(
          ModelPosition.fromAfterNode(currentElement),
          positionAfterList
        );

        const firstListElement = ModelRangeUtils.findFirstListElement(searchRange);
        if (firstListElement) {
          newStart = ModelPosition.fromInNode(firstListElement, 0);
        } else {
          const newPosition = this.findNextSuitablePosition(positionAfterList);
          if (!newPosition) {
            return;
          }

          newStart = newPosition;
        }
      // If the cursor is at the end of a table cell, we search for the next table cell and place
      // the cursor at start of it. If there is no next table cell, we search for a next suitable
      // position.
      } else if (ModelNodeUtils.isTableCell(currentElement)) {
        const tableContainerAncestors = rangeStart.findAncestors(ModelNodeUtils.isTableContainer);
        const tableContainer = tableContainerAncestors[0];

        const positionAfterTable = ModelPosition.fromAfterNode(tableContainer);
        const searchRange = new ModelRange(
          ModelPosition.fromAfterNode(currentElement),
          positionAfterTable
        );

        const firstTableCell = ModelRangeUtils.findFirstTableCell(searchRange);
        if (firstTableCell) {
          newStart = ModelPosition.fromInNode(firstTableCell, 0);
        } else {
          const newPosition = this.findNextSuitablePosition(positionAfterTable);
          if (!newPosition) {
            return;
          }

          newStart = newPosition;
        }
      // In all other cursor, we search for a previous suitable position.
      } else {
        const newPosition = this.findNextSuitablePosition(rangeStart);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
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
      // In case a list element or table is found, we place the cursor at the start of it.
      return ModelPosition.fromInNode(nextSuitableNode, 0);
    }

    throw new TypeAssertionError("Found not is not text related, a list element or a table cell");
  }

  private static skipInvisibleSpaces(start: ModelPosition): ModelPosition {
    let position = start;
    while (position.charactersAfter(1) === INVISIBLE_SPACE) {
      position = MoveRightCommand.getShiftedPosition(position);
    }

    return position;
  }

  private static getPositionInFirstListElement(node: ModelNode): ModelPosition {
    const searchRange = ModelRange.fromAroundNode(node);
    const firstListElement = ModelRangeUtils.findFirstListElement(searchRange);

    if (!firstListElement) {
      throw new ModelError("List without any list elements");
    }

    return ModelPosition.fromInNode(firstListElement, 0);
  }

  private static getPositionInFirstTableCell(node: ModelNode): ModelPosition {
    const searchRange = ModelRange.fromAroundNode(node);
    const firstTableCell = ModelRangeUtils.findFirstTableCell(searchRange);

    if (!firstTableCell) {
      throw new ModelError("Table without any table cells");
    }

    return ModelPosition.fromInNode(firstTableCell, 0);
  }

  private static getShiftedPosition(position: ModelPosition): ModelPosition {
    const shiftedPosition = position.clone();
    shiftedPosition.parentOffset++;

    return shiftedPosition;
  }
}
