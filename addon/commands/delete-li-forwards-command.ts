import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import {MisbehavedSelectionError, TypeAssertionError} from "@lblod/ember-rdfa-editor/utils/errors";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";

export default class DeleteLiForwardsCommand extends Command {
  name = "delete-li-forwards";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    // Make sure the cursor is right in front of the closing tag of a list element.
    return range.collapsed
      && !range.start.nodeAfter()
      && ModelNodeUtils.isListElement(range.start.parent);
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    // Find the uppermost list container that contains the current list element.
    const listAncestors = range.start.findAncestors(ModelNodeUtils.isListContainer);
    const topListContainer = listAncestors[listAncestors.length - 1];

    // Create a range that starts after the current list element and ends right in front of the closing tag
    // of the upper most list container. Use this range to search for the next list element.
    const searchRange = new ModelRange(
      ModelPosition.fromAfterNode(range.start.parent),
      ModelPosition.fromInNode(topListContainer, topListContainer.getMaxOffset())
    );
    const nextListElement = ModelRangeUtils.findFirstListElement(searchRange);

    this.model.change(mutator => {
      if (nextListElement) {
        // Search for a nested list inside the found list element.
        const firstListContainer = nextListElement.findFirstChild(ModelNodeUtils.isListContainer);
        let moveRange: ModelRange;

        if (firstListContainer) {
          if (!ModelNodeUtils.isListContainer(firstListContainer)) {
            throw new TypeAssertionError("Found node is not a list container");
          }

          // If we have found a nested list in the found list element, we select all content from the start of the
          // list element until right before the nested list.
          moveRange = new ModelRange(
            ModelPosition.fromInNode(nextListElement, 0),
            ModelPosition.fromBeforeNode(firstListContainer)
          );
        } else {
          // If we haven't found a nested list in the found list element, we select all content inside
          // the list element.
          moveRange = ModelRange.fromInElement(nextListElement, 0, nextListElement?.getMaxOffset());
        }

        // We obtain all nodes in the range we just selected.
        const nodesToMove = ModelRangeUtils.getNodesInRange(moveRange);
        if (firstListContainer) {
          mutator.insertNodes(moveRange);

          // If we have a nested list in the list element, we unwrap this nested list as well as the list element
          // itself. Assumption: A list element can contain only nested list.
          mutator.unwrap(firstListContainer);
          mutator.unwrap(nextListElement);
        } else {
          // If all the content inside the list element was selected, we remove the list element as a whole.
          mutator.insertNodes(ModelRange.fromAroundNode(nextListElement));
        }

        // We insert the removed nodes right behind the cursor.
        mutator.insertNodes(range, ...nodesToMove);
      } else {
        // If no more list element can be found in the current list, we search for suitable nodes behind the list.
        const positionAfterList = ModelPosition.fromAfterNode(topListContainer);
        const nodeAfterList = positionAfterList.nodeAfter();

        if (nodeAfterList
          && !ModelNodeUtils.isListContainer(nodeAfterList)
          && !ModelNodeUtils.isTableContainer(nodeAfterList)
        ) {
          let rangeAround: ModelRange;
          if (ModelNodeUtils.isBr(nodeAfterList.nextSibling)) {
            // If the next suitable node is followed by a "br", we also select this "br" for deletion.
            rangeAround = new ModelRange(
              ModelPosition.fromBeforeNode(nodeAfterList),
              ModelPosition.fromAfterNode(nodeAfterList.nextSibling)
            );
          } else {
            rangeAround = ModelRange.fromAroundNode(nodeAfterList);
          }

          mutator.insertNodes(rangeAround);
          if (!ModelNodeUtils.isBr(nodeAfterList)) {
            mutator.insertNodes(range, nodeAfterList);
          }
        }
      }
    });
  }
}
