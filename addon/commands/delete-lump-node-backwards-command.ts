import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {IllegalExecutionStateError, MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default class DeleteLumpNodeBackwardsCommand extends Command {
  name = "delete-lump-node-backwards";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range || !range.collapsed) {
      return false;
    }

    const nodeBefore = range.start.nodeBefore();
    return !!nodeBefore && ModelNodeUtils.isLumpNode(nodeBefore);
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const nodeBefore = range.start.nodeBefore();
    if (!nodeBefore) {
      throw new IllegalExecutionStateError("No node in front of the cursor");
    }

    const newStart = ModelPosition.fromBeforeNode(nodeBefore);
    const insertRange = new ModelRange(
      newStart,
      ModelPosition.fromAfterNode(nodeBefore)
    );

    // If the node before the cursor is a lump node, we remove the lump node as a whole.
    this.model.change(mutator => {
      this.model.selectRange(new ModelRange(newStart));
      mutator.insertNodes(insertRange);
    });
  }
}
