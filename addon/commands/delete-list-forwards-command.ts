import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import {
  IllegalExecutionStateError,
  MisbehavedSelectionError,
  ModelError,
  TypeAssertionError
} from "@lblod/ember-rdfa-editor/utils/errors";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default class DeleteListForwardsCommand extends Command {
  name = "delete-list-forwards";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    // Make sure the cursor is right in front of a list.
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

    // We search for the first list element in the list after the cursor.
    const listRange = ModelRange.fromAroundNode(nodeAfter);
    const firstListElement = ModelRangeUtils.findFirstListElement(listRange);
    if (!ModelNodeUtils.isListElement(firstListElement)) {
      throw new ModelError("List without any list elements");
    }

    const firstListContainer = firstListElement.findFirstChild(ModelNodeUtils.isListContainer);
    const rangeAroundLi = ModelRange.fromAroundNode(firstListElement);

    let rangeInsideLi: ModelRange;
    if (firstListContainer) {
      if (!ModelNodeUtils.isListContainer(firstListContainer)) {
        throw new TypeAssertionError("Found node is not a list container");
      }

      // If the first list element contains a nested list, we select all content in the list element until just
      // before this nested list.
      rangeInsideLi = new ModelRange(
        ModelPosition.fromInNode(firstListElement, 0),
        ModelPosition.fromBeforeNode(firstListContainer)
      );
    } else {
      // If the first list element doesn't contain a nested list, we select all content in the list element.
      rangeInsideLi = new ModelRange(
        ModelPosition.fromInNode(firstListElement, 0),
        ModelPosition.fromInNode(firstListElement, firstListElement.getMaxOffset()),
      );
    }

    const nodesToMove = ModelRangeUtils.getNodesInRange(rangeInsideLi);
    const bottomListContainer = ModelNodeUtils.findAncestor(firstListElement, ModelNodeUtils.isListContainer);
    if (!bottomListContainer) {
      throw new ModelError("List element without list container");
    }

    this.model.change(mutator => {
      if (!firstListContainer) {
        if (rangeAroundLi.start.nodeBefore() === null && rangeAroundLi.end.nodeAfter() === null) {
          // If the found list element is the only list element in its list container, we remove the whole
          // list container.
          mutator.insertNodes(ModelRange.fromAroundNode(bottomListContainer));
        } else {
          // Else, we only delete the list element itself.
          mutator.insertNodes(rangeAroundLi);
        }
      } else {
        // If we have a nested list inside the list element, we only remove the content in front of this nested list.
        // Thereafter, we unwrap this nested list as well as the list element itself.
        mutator.insertNodes(rangeInsideLi);
        mutator.unwrap(firstListContainer);
        mutator.unwrap(firstListElement);
      }

      mutator.insertNodes(range, ...nodesToMove);
    });
  }
}
