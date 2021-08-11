import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default class DeleteLiForwardsCommand extends Command {
  name = "delete-li-forwards";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    // Make sure the cursor is right before the closing tag of a list element.
    return range.collapsed
      && !range.start.nodeAfter()
      && ModelNodeUtils.isListElement(range.start.parent);
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }
  }
}
