import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
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

    // Retrieve all the nodes in the current list element. These will be the nodes we will place after the
    // new cursor position.
    let nodesToMove: ModelNode[] = [];
    if (rangeInsideLi.start.parentOffset !== rangeInsideLi.end.parentOffset) {
      const treeWalker = new ModelTreeWalker({
        range: rangeInsideLi,
        descend: false
      });
      nodesToMove = [...treeWalker];
    }

    const listAncestors = range.start.findAncestors(ModelNodeUtils.isListRelated);
    const topListContainer = listAncestors[listAncestors.length - 1];
    const bottomListContainer = listAncestors[1]; // Index 0 will be the li itself.

    const lastLi = ModelRangeUtils.findLastListElement(new ModelRange(
      ModelPosition.fromBeforeNode(topListContainer),
      ModelPosition.fromBeforeNode(currentLi)
    ));

    this.model.change(mutator => {
      if (rangeAroundLi.start.nodeBefore() === null && rangeAroundLi.end.nodeAfter() === null) {
        // Only li in the list, remove the parent "ul" or "ol".
        mutator.insertNodes(ModelRange.fromAroundNode(bottomListContainer));
      } else {
        mutator.insertNodes(rangeAroundLi);
      }

      const newCursorPosition = lastLi
        ? ModelPosition.fromInElement(lastLi, lastLi.getMaxOffset())
        : ModelPosition.fromBeforeNode(topListContainer);

      const newRange = new ModelRange(newCursorPosition, newCursorPosition);
      this.model.selectRange(newRange);

      mutator.insertNodes(newRange, ...nodesToMove);
    });
  }
}
