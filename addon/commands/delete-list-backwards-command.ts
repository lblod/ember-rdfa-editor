import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {
  IllegalExecutionStateError,
  ImpossibleModelStateError,
  MisbehavedSelectionError
} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default class DeleteListBackwardsCommand extends Command {
  name = "delete-list-backwards";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    return range.collapsed && ModelNodeUtils.isListContainer(range.start.nodeBefore());
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const nodeBefore = range.start.nodeBefore();
    if (!ModelNodeUtils.isListContainer(nodeBefore)) {
      throw new IllegalExecutionStateError("Node in front of cursor in not a list container");
    }

    // We search for the last list element in the list in front of the cursor.
    const listRange = ModelRange.fromAroundNode(nodeBefore);
    const lastLi = ModelRangeUtils.findLastListElement(listRange);
    if (!lastLi) {
      throw new ImpossibleModelStateError("No list element found in list");
    }

    const newStart = ModelPosition.fromInElement(lastLi, lastLi.getMaxOffset());
    const newRange = new ModelRange(newStart);

    this.model.change(mutator => {
      const nodeAfterList = range.start.nodeAfter();
      // We check if there is a suitable node right behind the list.
      // If so, we move this upwards into the list.
      if (nodeAfterList
        && !ModelNodeUtils.isListContainer(nodeAfterList)
        && !ModelNodeUtils.isTableContainer(nodeAfterList)
      ) {
        let rangeAround: ModelRange;
        if (ModelNodeUtils.isBr(nodeAfterList.nextSibling)) {
          // If there is a "br" right behind the suitable node we found, we also select this "br" for deletion.
          rangeAround = new ModelRange(
            ModelPosition.fromBeforeNode(nodeAfterList),
            ModelPosition.fromAfterNode(nodeAfterList.nextSibling)
          );
        } else {
          rangeAround = ModelRange.fromAroundNode(nodeAfterList);
        }

        mutator.insertNodes(rangeAround);
        this.model.selectRange(newRange);
        mutator.insertNodes(newRange, nodeAfterList);
      } else {
        this.model.selectRange(newRange);
      }
    });
  }
}
