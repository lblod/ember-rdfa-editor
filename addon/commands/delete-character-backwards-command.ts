import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {IllegalExecutionStateError, MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default class DeleteCharacterBackwardsCommand extends Command {
  name = "delete-character-backwards";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    // Make sure the cursor is right behind a character or "br".
    return range.collapsed && ModelNodeUtils.isTextRelated(range.start.nodeBefore());
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const nodeBefore = range.start.nodeBefore();
    if (!nodeBefore) {
      throw new IllegalExecutionStateError("No node in front of the cursor");
    }

    let newStart: ModelPosition;
    let characterRange: ModelRange;
    if (ModelNode.isModelText(nodeBefore)) {
      // If there is a character before the cursor, we create a new range starting one position to the left and
      // ending at the current cursor position.
      newStart = range.start.clone();
      newStart.parentOffset--;

      characterRange = new ModelRange(newStart, range.end);
    } else {
      // If there is a "br" before the cursor, we create a range around this "br".
      newStart = ModelPosition.fromBeforeNode(nodeBefore);
      characterRange = new ModelRange(
        newStart,
        ModelPosition.fromAfterNode(nodeBefore)
      );
    }

    this.model.change(mutator => {
      mutator.insertNodes(characterRange);

      const nodeBeforeCursor = newStart.nodeBefore();
      const nodeAfterCursor = newStart.nodeAfter();

      // If both the node before and after the cursor are text, we try to merge them, since they can be split.
      if (ModelNode.isModelText(nodeBeforeCursor) && ModelNode.isModelText(nodeAfterCursor)) {
        const mergeRange = new ModelRange(
          ModelPosition.fromBeforeNode(nodeBeforeCursor),
          ModelPosition.fromAfterNode(nodeAfterCursor)
        );
        mutator.mergeTextNodesInRange(mergeRange);
      }

      this.model.selectRange(new ModelRange(newStart));
    });
  }
}
