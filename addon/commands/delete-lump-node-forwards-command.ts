import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import {IllegalExecutionStateError, MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";

export default class DeleteLumpNodeForwardsCommand extends Command {
  name = "delete-lump-node-forwards";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range || !range.collapsed) {
      return false;
    }

    const nodeAfter = range.start.nodeAfter();
    return !!nodeAfter && ModelNodeUtils.isLumpNode(nodeAfter);
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const nodeAfter = range.start.nodeAfter();
    if (!nodeAfter) {
      throw new IllegalExecutionStateError("No node after the cursor");
    }

    const insertRange = ModelRange.fromAroundNode(nodeAfter);
    this.model.change(mutator => {
      mutator.insertNodes(insertRange);
    });
  }
}
