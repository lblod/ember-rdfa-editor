import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";

export default class DeleteLiForwardsCommand extends Command {
  name = "delete-li-forwards";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    // Make sure the cursor is right before the closing tag of a list element.
    return range.collapsed
      && !range.start.nodeAfter()
      && ModelNodeUtils.isListElement(range.start.parent);
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    // Find the uppermost list container of the list containing the list element.
    const listAncestors = range.start.findAncestors(ModelNodeUtils.isListContainer);
    const topListContainer = listAncestors[listAncestors.length - 1];

    // Search the next list element starting from after the current list element and ending right
    // behind the uppermost list container.
    const searchRange = new ModelRange(
      ModelPosition.fromAfterNode(range.start.parent),
      ModelPosition.fromInNode(topListContainer, topListContainer.getMaxOffset())
    );
    const nextListElement = ModelRangeUtils.findFirstListElement(searchRange);

    this.model.change(mutator => {
      if (nextListElement) {
        const moveRange = ModelRange.fromInElement(nextListElement, 0, nextListElement?.getMaxOffset());
        const nodesToMove = DeleteLiForwardsCommand.getNodesInRange(moveRange);

        mutator.insertNodes(ModelRange.fromAroundNode(nextListElement));
        mutator.insertNodes(range, ...nodesToMove);
      } else {
        const positionAfterList = ModelPosition.fromAfterNode(topListContainer);
        const nodeAfterList = positionAfterList.nodeAfter();

        if (nodeAfterList
          && !ModelNodeUtils.isListContainer(nodeAfterList)
          && !ModelNodeUtils.isTableContainer(nodeAfterList)
        ) {
          let rangeAround: ModelRange;
          if (ModelNodeUtils.isBr(nodeAfterList.nextSibling)) {
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

  private static getNodesInRange(range: ModelRange) {
    if (!range.collapsed) {
      const treeWalker = new ModelTreeWalker({
        range: range,
        descend: false
      });

      return [...treeWalker];
    }

    return [];
  }
}
