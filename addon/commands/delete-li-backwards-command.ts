import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default class DeleteLiBackwardsCommand extends Command {
  name = "delete-li-backwards";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    // Make sure the cursor is right after the opening tag of a list element.
    return range.collapsed
      && !range.start.nodeBefore()
      && ModelNodeUtils.isListElement(range.start.parent);
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const currentLi = range.start.parent;
    const rangeInsideLi = ModelRange.fromInElement(currentLi, 0, currentLi.getMaxOffset());
    const rangeAroundLi = ModelRange.fromAroundNode(currentLi);

    const nodesToMove = ModelRangeUtils.getNodesInRange(rangeInsideLi);

    const listAncestors = range.start.findAncestors(ModelNodeUtils.isListContainer);
    const topListContainer = listAncestors[listAncestors.length - 1];
    const bottomListContainer = listAncestors[0];

    // We search for the last list element in the upper most list container before the current list container.
    const lastLi = ModelRangeUtils.findLastListElement(new ModelRange(
      ModelPosition.fromBeforeNode(topListContainer),
      ModelPosition.fromBeforeNode(currentLi)
    ));

    this.model.change(mutator => {
      if (rangeAroundLi.start.nodeBefore() === null && rangeAroundLi.end.nodeAfter() === null) {
        // Only li in the list, remove the parent "ul" or "ol".
        mutator.insertNodes(ModelRange.fromAroundNode(bottomListContainer));
      } else {
        // If not the only list element in the list, we remove this list element.
        mutator.insertNodes(rangeAroundLi);
      }

      const newCursorPosition = lastLi
        ? ModelPosition.fromInElement(lastLi, lastLi.getMaxOffset())
        : ModelPosition.fromBeforeNode(topListContainer);

      const newRange = new ModelRange(newCursorPosition);
      this.model.selectRange(newRange);

      mutator.insertNodes(newRange, ...nodesToMove);
    });
  }
}
