import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import {IllegalExecutionStateError, MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default class DeleteCharacterForwardsCommand extends Command {
  name = "delete-character-forwards";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    // Make sure the cursor is right behind a character or "br".
    return range.collapsed && ModelNodeUtils.isTextRelated(range.start.nodeAfter());
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const nodeAfter = range.start.nodeAfter();
    if (!nodeAfter) {
      throw new IllegalExecutionStateError("No node after the cursor");
    }

    let characterRange: ModelRange;
    if (ModelNode.isModelText(nodeAfter)) {
      const newEnd = range.end.clone();
      newEnd.parentOffset++;

      characterRange = new ModelRange(range.start, newEnd);
    } else {
      characterRange = ModelRange.fromAroundNode(nodeAfter);
    }

    this.model.change(mutator => {
      mutator.insertNodes(characterRange);

      // Merge all text nodes that can be currently split.
      const nodeBeforeCursor = range.start.nodeBefore();
      const nodeAfterCursor = range.start.nodeAfter();

      if (ModelNode.isModelText(nodeBeforeCursor) && ModelNode.isModelText(nodeAfterCursor)) {
        const mergeRange = new ModelRange(
          ModelPosition.fromBeforeNode(nodeBeforeCursor),
          ModelPosition.fromAfterNode(nodeAfterCursor)
        );
        mutator.mergeTextNodesInRange(mergeRange);
      }
    });
  }
}
