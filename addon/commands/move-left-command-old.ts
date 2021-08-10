import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {MisbehavedSelectionError, ModelError, TypeAssertionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
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
      // Search for the last list element of this list and place the cursor at the end of it.
      } else if (ModelNodeUtils.isListContainer(nodeBefore)) {
        newStart = MoveLeftCommand.getPositionInLastListElement(nodeBefore);
      // Search for the last table cell of this table and place the cursor at the end of it.
      } else if (ModelNodeUtils.isTableContainer(nodeBefore)) {
        newStart = MoveLeftCommand.getPositionInLastTableCell(nodeBefore);
      // In all other cursor, we search for a previous suitable position.
      } else {
        const newPosition = this.findPreviousSuitablePosition(rangeStart);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
    } else {
      const currentElement = rangeStart.parent;
      // If the cursor is at the start of a list element, we search for the previous list element and place
      // the cursor right before the first nested list in this list element. If there is no previous list
      // element, we search for a previous suitable position.
      if (ModelNodeUtils.isListElement(currentElement)) {
        const listRelatedAncestors = rangeStart.findAncestors(ModelNodeUtils.isListContainer);
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
          const newPosition = this.findPreviousSuitablePosition(positionBeforeList);
          if (!newPosition) {
            return;
          }

          newStart = newPosition;
        }
      // If the cursor is at the start of a table cell, we search for the previous table cell and place
      // the cursor at end of it. If there is no previous table cell, we search for a previous suitable
      // position.
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
          const newPosition = this.findPreviousSuitablePosition(positionBeforeTable);
          if (!newPosition) {
            return;
          }

          newStart = newPosition;
        }
      // In all other cursor, we search for a previous suitable position.
      } else {
        const newPosition = this.findPreviousSuitablePosition(rangeStart);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
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
        return ModelNode.isModelText(node)
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
    } else if (ModelNodeUtils.isListElement(previousSuitableNode) || ModelNodeUtils.isTableCell(previousSuitableNode)) {
      // In case a list element or table is found, we place the cursor at the end of it.
      return ModelPosition.fromInNode(previousSuitableNode, previousSuitableNode.getMaxOffset());
    }

    throw new TypeAssertionError("Found not is not text related, a list element or a table cell");
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

  private static getShiftedPosition(position: ModelPosition): ModelPosition {
    const shiftedPosition = position.clone();
    shiftedPosition.parentOffset--;

    return shiftedPosition;
  }
}
