import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {MisbehavedSelectionError, ModelError} from "@lblod/ember-rdfa-editor/utils/errors";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";

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

    let newStart: ModelPosition;
    const nodeAfter = range.start.nodeAfter();

    if (nodeAfter) {
      // Move the cursor one place to the right, since there is a character right behind it.
      if (ModelNode.isModelText(nodeAfter)) {
        newStart = range.start.clone();
        newStart.parentOffset++;
      // Move the cursor before the "br" that is before it.
      } else if (ModelNodeUtils.isBr(nodeAfter)) {
        newStart = ModelPosition.fromAfterNode(nodeAfter);
      // If cursor is right before a list, place the cursor at the start of the first list element.
      } else if (ModelNodeUtils.isListContainer(nodeAfter)) {
        const searchRange = ModelRange.fromAroundNode(nodeAfter);
        const firstListElement = ModelRangeUtils.findFirstListElement(searchRange);

        if (!firstListElement) {
          throw new ModelError("List without any list elements");
        }

        newStart = ModelPosition.fromInNode(firstListElement, 0);
      // If cursor is right before a table, place the cursor at the start.
      } else if (ModelNodeUtils.isTableContainer(nodeAfter)) {
        const searchRange = ModelRange.fromAroundNode(nodeAfter);
        const firstTableCell = ModelRangeUtils.findFirstTableCell(searchRange);

        if (!firstTableCell) {
          throw new ModelError("Table without any table cells");
        }

        newStart = ModelPosition.fromInNode(firstTableCell, 0);
      // In all other cases, we search for the first text related node after the cursor and place the
      // cursor right before it.
      } else {
        const newPosition = this.getPositionBeforeFirstTextRelatedNode(range.start);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
    } else {
      const currentElement = range.start.parent;

      // If the cursor is at the end of a list element, we search for the next list element and place
      // the cursor right at the start of it. If there is no next list element, we place the cursor right behind the
      // list.
      if (ModelNodeUtils.isListElement(currentElement)) {
        const listRelatedAncestors = range.start.findAncestors(ModelNodeUtils.isListRelated);
        const topListContainer = listRelatedAncestors[listRelatedAncestors.length - 1];

        const positionAfterList = ModelPosition.fromAfterNode(topListContainer);
        const searchRange = new ModelRange(
          ModelPosition.fromAfterNode(currentElement),
          positionAfterList
        );

        const firstListElement = ModelRangeUtils.findFirstListElement(searchRange);
        newStart = firstListElement
          ? ModelPosition.fromInNode(firstListElement, 0)
          : positionAfterList;
      // If the cursor is at the end of a table cell, we search for the next table cell and place
      // the cursor at start of it. If there is no next table cell, we place the cursor right behind the table.
      } else if (ModelNodeUtils.isTableCell(currentElement)) {
        const tableContainerAncestors = range.start.findAncestors(ModelNodeUtils.isTableContainer);
        const tableContainer = tableContainerAncestors[0];

        const positionAfterTable = ModelPosition.fromAfterNode(tableContainer);
        const searchRange = new ModelRange(
          ModelPosition.fromAfterNode(currentElement),
          positionAfterTable
        );

        const firstTableCell = ModelRangeUtils.findFirstTableCell(searchRange);
        newStart = firstTableCell
          ? ModelPosition.fromInNode(firstTableCell, 0)
          : positionAfterTable;
      // In all other cases, we search for the first text related node after the cursor and place the
      // cursor right before it.
      } else {
        const newPosition = this.getPositionBeforeFirstTextRelatedNode(range.start);
        if (!newPosition) {
          return;
        }

        newStart = newPosition;
      }
    }

    const newRange = new ModelRange(newStart);
    this.model.change(_ => this.model.selectRange(newRange));
  }

  private getPositionBeforeFirstTextRelatedNode(cursorPosition: ModelPosition): ModelPosition | null {
    const searchRange = new ModelRange(
      cursorPosition,
      ModelPosition.fromInElement(this.model.rootModelNode, this.model.rootModelNode.getMaxOffset())
    );

    if (searchRange.start.sameAs(searchRange.end)) {
      return null;
    }

    const firstTextRelatedNode = ModelRangeUtils.findFirstTextRelatedNode(searchRange);
    if (!firstTextRelatedNode) {
      return null;
    }

    return ModelPosition.fromBeforeNode(firstTextRelatedNode);
  }
}
