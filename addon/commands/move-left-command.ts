import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {MisbehavedSelectionError, ModelError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";

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

    let newStart: ModelPosition;
    const nodeBefore = range.start.nodeBefore();

    if (nodeBefore) {
      // Move the cursor one place to the left, since there is a character right before it.
      if (ModelNode.isModelText(nodeBefore)) {
        newStart = range.start.clone();
        newStart.parentOffset--;
      // Move the cursor before the "br" that is before it.
      } else if (ModelNodeUtils.isBr(nodeBefore)) {
        newStart = ModelPosition.fromBeforeNode(nodeBefore);
      // If cursor is right behind a list, place the cursor at the end of the last list element.
      } else if (ModelNodeUtils.isListContainer(nodeBefore)) {
        const searchRange = ModelRange.fromAroundNode(nodeBefore);
        const lastListElement = ModelRangeUtils.findLastListElement(searchRange);

        if (!lastListElement) {
          throw new ModelError("List without any list elements");
        }

        newStart = ModelPosition.fromInNode(lastListElement, lastListElement.getMaxOffset());
      // If cursor is right behind a table, place the cursor at the end of the last table cell.
      } else if (ModelNodeUtils.isTableContainer(nodeBefore)) {
        const searchRange = ModelRange.fromAroundNode(nodeBefore);
        const lastTableCell = ModelRangeUtils.findLastTableCell(searchRange);

        if (!lastTableCell) {
          throw new ModelError("Table without any table cells");
        }

        newStart = ModelPosition.fromInNode(lastTableCell, lastTableCell.getMaxOffset());
      // In all other cases, we search for the last text related node in front of the cursor and place the
      // cursor right behind it.
      } else {
        const newPosition = this.getPositionAfterLastTextRelatedNode(range.start);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
    } else {
      const currentElement = range.start.parent;

      // If the cursor is at the start of a list element, we search for the previous list element and place
      // the cursor right before the first nested list in this list element. If there is no previous list
      // element, we place the cursor before the list.
      if (ModelNodeUtils.isListElement(currentElement)) {
        const listRelatedAncestors = range.start.findAncestors(ModelNodeUtils.isListRelated);
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
          newStart = positionBeforeList;
        }
      // If the cursor is at the start of a table cell, we search for the previous table cell and place
      // the cursor at end of it. If there is no previous table cell, we place the cursor right before the table.
      } else if (ModelNodeUtils.isTableCell(currentElement)) {
        const tableContainerAncestors = range.start.findAncestors(ModelNodeUtils.isTableContainer);
        const tableContainer = tableContainerAncestors[0];

        const positionBeforeTable = ModelPosition.fromBeforeNode(tableContainer);
        const searchRange = new ModelRange(
          positionBeforeTable,
          ModelPosition.fromBeforeNode(currentElement)
        );

        const lastTableCell = ModelRangeUtils.findLastTableCell(searchRange);
        newStart = lastTableCell
          ? ModelPosition.fromInNode(lastTableCell, lastTableCell.getMaxOffset())
          : positionBeforeTable;
      // In all other cases, we search for the last text related node in front of the cursor and place the
      // cursor right behind it.
      } else {
        const newPosition = this.getPositionAfterLastTextRelatedNode(range.start);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
    }

    const newRange = new ModelRange(newStart);
    this.model.change(_ => this.model.selectRange(newRange));
  }

  private getPositionAfterLastTextRelatedNode(cursorPosition: ModelPosition): ModelPosition | null {
    const searchRange = new ModelRange(
      ModelPosition.fromInElement(this.model.rootModelNode, 0),
      cursorPosition
    );

    if (searchRange.start.sameAs(searchRange.end)) {
      return null;
    }

    const lastTextRelatedNode = ModelRangeUtils.findLastTextRelatedNode(searchRange);
    if (!lastTextRelatedNode) {
      return null;
    }

    return ModelPosition.fromAfterNode(lastTextRelatedNode);
  }
}
