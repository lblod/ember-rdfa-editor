import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import {IllegalExecutionStateError, MisbehavedSelectionError, ModelError} from "@lblod/ember-rdfa-editor/utils/errors";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";

export default class DeleteListForwardsCommand extends Command {
  name = "delete-list-forwards";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    return range.collapsed && ModelNodeUtils.isListContainer(range.start.nodeAfter());
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const nodeAfter = range.start.nodeAfter();
    if (!nodeAfter) {
      throw new IllegalExecutionStateError("No node after the cursor");
    }

    const listRange = ModelRange.fromAroundNode(nodeAfter);
    const firstListElement = ModelRangeUtils.findFirstListElement(listRange);
    if (!ModelNodeUtils.isListElement(firstListElement)) {
      throw new ModelError("List without any list elements");
    }

    const firstListContainer = firstListElement.findFirstChild(ModelNodeUtils.isListContainer);
    const rangeAroundLi = ModelRange.fromAroundNode(firstListElement);

    let liFullySelected: boolean;
    let rangeInsideLi: ModelRange;
    if (firstListContainer) {
      liFullySelected = false;
      rangeInsideLi = new ModelRange(
        ModelPosition.fromInNode(firstListElement, 0),
        ModelPosition.fromBeforeNode(firstListContainer)
      );
    } else {
      liFullySelected = true;
      rangeInsideLi = new ModelRange(
        ModelPosition.fromInNode(firstListElement, 0),
        ModelPosition.fromInNode(firstListElement, firstListElement.getMaxOffset()),
      );
    }

    let nodesToMove: ModelNode[] = [];
    if (rangeInsideLi.start.parentOffset !== rangeInsideLi.end.parentOffset) {
      const treeWalker = new ModelTreeWalker({
        range: rangeInsideLi,
        descend: false
      });
      nodesToMove = [...treeWalker];
    }

    const bottomListContainer = ModelNodeUtils.findAncestor(firstListElement, ModelNodeUtils.isListContainer);
    if (!bottomListContainer) {
      throw new ModelError("List element without list container");
    }

    this.model.change(mutator => {
      if (liFullySelected
        && rangeAroundLi.start.nodeBefore() === null
        && rangeAroundLi.end.nodeAfter() === null
      ) {
        mutator.insertNodes(ModelRange.fromAroundNode(bottomListContainer));
      } else if (liFullySelected) {
        mutator.insertNodes(rangeAroundLi);
      } else {
        mutator.insertNodes(rangeInsideLi);
      }

      mutator.insertNodes(range, ...nodesToMove);
    });
  }
}
