import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {MisbehavedSelectionError, ModelError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelPositionUtils from "@lblod/ember-rdfa-editor/model/util/model-position-utils";
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
      // Move the cursor one place to the left, since there is a character right before it.
      if (ModelNode.isModelText(nodeBefore)) {
        newStart = MoveLeftCommand.getShiftedPosition(rangeStart);
      // Move the cursor before the "br" that is before it.
      } else if (ModelNodeUtils.isBr(nodeBefore)) {
        newStart = ModelPosition.fromBeforeNode(nodeBefore);
      // If cursor is right behind a list, place the cursor at the end of the last list element.
      } else if (ModelNodeUtils.isListContainer(nodeBefore)) {
        newStart = MoveLeftCommand.getPositionInLastListElement(nodeBefore);
      // If cursor is right behind a table, place the cursor at the end of the last table cell.
      } else if (ModelNodeUtils.isTableContainer(nodeBefore)) {
        newStart = MoveLeftCommand.getPositionInLastTableCell(nodeBefore);
      // In all other cases, we search for the last text related node after the previous list or table.
      // If no text related node can be found, we place the cursor at the end of the last list element
      // or table cell of the previous list or table. If also no previous list or table are found, we just keep
      // the cursor as is.
      } else {
        const newPosition = MoveLeftCommand.findPreviousSuitablePosition(rangeStart);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
    } else {
      const currentElement = rangeStart.parent;

      // If the cursor is at the start of a list element, we search for the previous list element and place
      // the cursor right before the first nested list in this list element. If there is no previous list
      // element, we search for the last text related node after the previous list or table.
      // If no text related node can be found, we place the cursor at the end of the last list element
      // or table cell of the previous list or table. If also no previous list or table are found, we just keep
      // the cursor as is.
      if (ModelNodeUtils.isListElement(currentElement)) {
        const listRelatedAncestors = rangeStart.findAncestors(ModelNodeUtils.isListRelated);
        const topListContainer = listRelatedAncestors[listRelatedAncestors.length - 1];

        const positionBeforeList = ModelPosition.fromBeforeNode(topListContainer);
        const searchRange = new ModelRange(
          positionBeforeList,
          ModelPosition.fromBeforeNode(currentElement)
        );

        const lastListElement = ModelRangeUtils.findLastListElement(searchRange);
        if (lastListElement) {
          const firstListContainer = lastListElement.findFirstChild(ModelNodeUtils.isListContainer);
          newStart = firstListContainer
            ? ModelPosition.fromBeforeNode(firstListContainer)
            : ModelPosition.fromInNode(lastListElement, lastListElement.getMaxOffset());
        } else {
          const newPosition = MoveLeftCommand.findPreviousSuitablePosition(positionBeforeList);
          if (!newPosition) {
            return;
          }

          newStart = newPosition;
        }
      // If the cursor is at the start of a table cell, we search for the previous table cell and place
      // the cursor at end of it. If there is no previous table cell, we search for the last text related node after the
      // previous list or table. If no text related node can be found, we place the cursor at the end of the last
      // list element or table cell of the previous list or table. If also no previous list or table are found, we
      // just keep the cursor as is.
      } else if (ModelNodeUtils.isTableCell(currentElement)) {
        const tableContainerAncestors = rangeStart.findAncestors(ModelNodeUtils.isTableContainer);
        const tableContainer = tableContainerAncestors[0];

        const positionBeforeTable = ModelPosition.fromBeforeNode(tableContainer);
        const searchRange = new ModelRange(
          positionBeforeTable,
          ModelPosition.fromBeforeNode(currentElement)
        );

        const lastTableCell = ModelRangeUtils.findLastTableCell(searchRange);
        if (lastTableCell) {
          newStart = ModelPosition.fromInNode(lastTableCell, lastTableCell.getMaxOffset());
        } else {
          const newPosition = MoveLeftCommand.findPreviousSuitablePosition(positionBeforeTable);
          if (!newPosition) {
            return;
          }

          newStart = newPosition;
        }
      // In all other cases, we search for the last text related node after the previous list or table.
      // If no text related node can be found, we place the cursor at the end of the last list element
      // or table cell of the previous list or table. If also no previous list or table are found, we just keep
      // the cursor as is.
      } else {
        const newPosition = MoveLeftCommand.findPreviousSuitablePosition(rangeStart);
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
    while (position.charactersBefore(1) === INVISIBLE_SPACE) {
      position = MoveLeftCommand.getShiftedPosition(position);
    }

    return position;
  }

  private static getPositionInLastListElement(node: ModelNode): ModelPosition {
    const searchRange = ModelRange.fromAroundNode(node);
    const lastListElement = ModelRangeUtils.findLastListElement(searchRange);

    if (!lastListElement) {
      throw new ModelError("List without any list elements");
    }

    return ModelPosition.fromInNode(lastListElement, lastListElement.getMaxOffset());
  }

  private static getPositionInLastTableCell(node: ModelNode): ModelPosition {
    const searchRange = ModelRange.fromAroundNode(node);
    const lastTableCell = ModelRangeUtils.findLastTableCell(searchRange);

    if (!lastTableCell) {
      throw new ModelError("Table without any table cells");
    }

    return ModelPosition.fromInNode(lastTableCell, lastTableCell.getMaxOffset());
  }

  private static findPreviousSuitablePosition(startPosition: ModelPosition): ModelPosition | null {
    const previousListOrTable = ModelPositionUtils.findNodeBeforePosition(
      startPosition,
      node => ModelNodeUtils.isListContainer(node) || ModelNodeUtils.isTableContainer(node)
    );
    const endPosition = previousListOrTable
      ? ModelPosition.fromAfterNode(previousListOrTable)
      : ModelPosition.fromInElement(startPosition.parent, 0);

    const searchRange = new ModelRange(endPosition, startPosition);

    let lastTextRelatedNode = null;
    if (!searchRange.start.sameAs(searchRange.end)) {
      lastTextRelatedNode = ModelRangeUtils.findLastTextRelatedNode(searchRange);
    }

    if (lastTextRelatedNode) {
      return ModelPosition.fromAfterNode(lastTextRelatedNode);
    } else if (previousListOrTable) {
      return ModelNodeUtils.isListContainer(previousListOrTable)
        ? MoveLeftCommand.getPositionInLastListElement(previousListOrTable)
        : MoveLeftCommand.getPositionInLastTableCell(previousListOrTable);
    }

    return null;
  }

  private static getShiftedPosition(position: ModelPosition): ModelPosition {
    const shiftedPosition = position.clone();
    shiftedPosition.parentOffset--;

    return shiftedPosition;
  }
}
