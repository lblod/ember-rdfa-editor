import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";

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
      throw new Error("Node in front of cursor in not a list container");
    }

    const lastLi = ModelRangeUtils.findLastListElement(nodeBefore);
    if (!lastLi) {
      throw new Error("No li found in list");
    }

    this.model.change(mutator => {
      const nodeAfter = range.start.nodeAfter();
      if (nodeAfter && ModelNode.isModelText(nodeAfter)) {
        const textRange = ModelRange.fromAroundNode(nodeAfter);
        mutator.insertNodes(textRange);
      }

      const newStart = ModelPosition.fromInElement(lastLi, lastLi.getMaxOffset());
      const newRange = new ModelRange(newStart, newStart);

      this.model.selectRange(newRange);
      if (nodeAfter && ModelNode.isModelText(nodeAfter)) {
        mutator.insertNodes(newRange, nodeAfter);
      } else {
        mutator.insertNodes(newRange);
      }
    });
  }
}
