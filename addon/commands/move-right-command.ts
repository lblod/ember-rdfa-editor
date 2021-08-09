import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {MisbehavedSelectionError, ModelError} from "@lblod/ember-rdfa-editor/utils/errors";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelPositionUtils from "@lblod/ember-rdfa-editor/model/util/model-position-utils";
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
      // If cursor is right before a list, place the cursor at the start of the first list element.
      } else if (ModelNodeUtils.isListContainer(nodeAfter)) {
        newStart = MoveRightCommand.getPositionInFirstListElement(nodeAfter);
      // If cursor is right before a table, place the cursor at the start.
      } else if (ModelNodeUtils.isTableContainer(nodeAfter)) {
        newStart = MoveRightCommand.getPositionInFirstTableCell(nodeAfter);
      // In all other cases, we search for the first text related node before the next list or table.
      // If no text related node can be found, we place the cursor at the start of the first list element
      // or table cell of the next list or table. If also no next list or table are found, we just keep
      // the cursor as is.
      } else {
        const newPosition = MoveRightCommand.findNextSuitablePosition(rangeStart);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
    } else {
      const currentElement = rangeStart.parent;

      // If the cursor is at the end of a list element, we search for the next list element and place
      // the cursor right at the start of it. If there is no next list element, we place the cursor right behind the
      // list.
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
          const newPosition = MoveRightCommand.findNextSuitablePosition(positionAfterList);
          if (!newPosition) {
            return;
          }

          newStart = newPosition;
        }
      // If the cursor is at the end of a table cell, we search for the next table cell and place
      // the cursor at start of it. If there is no next table cell, we place the cursor right behind the table.
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
          const newPosition = MoveRightCommand.findNextSuitablePosition(positionAfterTable);
          if (!newPosition) {
            return;
          }

          newStart = newPosition;
        }
      // In all other cases, we search for the first text related node after the cursor and place the
      // cursor right before it.
      } else {
        const newPosition = MoveRightCommand.findNextSuitablePosition(rangeStart);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
    }

    const newRange = new ModelRange(newStart);
    this.model.change(_ => this.model.selectRange(newRange));
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

  private static findNextSuitablePosition(startPosition: ModelPosition): ModelPosition | null {
    const nextListOrTable = ModelPositionUtils.findNodeAfterPosition(
      startPosition,
      node => ModelNodeUtils.isListContainer(node) || ModelNodeUtils.isTableContainer(node)
    );
    const endPosition = nextListOrTable
      ? ModelPosition.fromBeforeNode(nextListOrTable)
      : ModelPosition.fromInElement(startPosition.parent, startPosition.parent.getMaxOffset());

    const searchRange = new ModelRange(startPosition, endPosition);

    let firstTextRelatedNode = null;
    if (!searchRange.start.sameAs(searchRange.end)) {
      firstTextRelatedNode = ModelRangeUtils.findFirstTextRelatedNode(searchRange);
    }

    if (firstTextRelatedNode) {
      return ModelPosition.fromBeforeNode(firstTextRelatedNode);
    } else if (nextListOrTable) {
      return ModelNodeUtils.isListContainer(nextListOrTable)
        ? MoveRightCommand.getPositionInFirstListElement(nextListOrTable)
        : MoveRightCommand.getPositionInFirstTableCell(nextListOrTable);
    }

    return null;
  }

  private static getShiftedPosition(position: ModelPosition): ModelPosition {
    const shiftedPosition = position.clone();
    shiftedPosition.parentOffset++;

    return shiftedPosition;
  }
}
