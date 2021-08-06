import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default class MoveLeftCommand extends Command {
  name = "move-left";

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
    const nodeBefore = range.start.nodeBefore();
    if (ModelNode.isModelText(nodeBefore)) {
      newStart = range.start.clone();
      newStart.parentOffset--;
    } else {
      const searchRange = new ModelRange(
        ModelPosition.fromInElement(this.model.rootModelNode, 0),
        range.start
      );

      const lastTextRelatedNode = ModelRangeUtils.findLastTextRelatedNode(searchRange);
      if (!lastTextRelatedNode) {
        return;
      }

      newStart = ModelPosition.fromAfterNode(lastTextRelatedNode);
    }

    const newRange = new ModelRange(newStart);
    this.model.change(_ => this.model.selectRange(newRange));
  }
}
