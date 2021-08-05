import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";

export default class DeleteCharacterBackwardsCommand extends Command<unknown[], string> {
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

  execute(range: ModelRange | null = this.model.selection.lastRange): string {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const nodeBefore = range.start.nodeBefore();
    if (!nodeBefore) {
      throw new Error("No node in front of the cursor");
    }

    let characterRange: ModelRange;
    if (ModelNode.isModelText(nodeBefore)) {
      const newStart = range.start.clone();
      newStart.parentOffset--;

      characterRange = new ModelRange(newStart, range.end);
    } else {
      characterRange = ModelRange.fromAroundNode(nodeBefore);
    }

    let result = "";
    this.model.change(mutator => {
      const treeWalker = new ModelTreeWalker({
        range: characterRange,
        descend: false
      });

      const resultNode = treeWalker.currentNode;
      if (!resultNode) {
        throw new Error("No node found in range");
      }

      if (ModelNode.isModelText(resultNode)) {
        result = resultNode.content;
      } else {
        result = "\n";
      }

      this.model.selectRange(mutator.insertNodes(characterRange));
    });

    return result;
  }
}
