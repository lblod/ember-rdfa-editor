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
    if (!nodeBefore || !ModelNodeUtils.isListContainer(nodeBefore)) {
      throw new IllegalExecutionStateError("Node in front of cursor in not a list container");
    }

    const listRange = ModelRange.fromAroundNode(nodeBefore);
    const lastLi = ModelRangeUtils.findLastListElement(listRange);
    if (!lastLi) {
      throw new ImpossibleModelStateError("No li found in list");
    }

    const newStart = ModelPosition.fromInElement(lastLi, lastLi.getMaxOffset());
    const newRange = new ModelRange(newStart);

    this.model.change(mutator => {
      const nodeAfter = range.start.nodeAfter();
      if (nodeAfter) {
        mutator.insertNodes(ModelRange.fromAroundNode(nodeAfter));
      }
      this.model.selectRange(newRange);

      if (nodeAfter) {
        mutator.insertNodes(newRange, nodeAfter);
      }
    });
  }
}
