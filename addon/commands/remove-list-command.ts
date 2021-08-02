import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";

export default class RemoveListCommand extends Command {
  name = "remove-list";

  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    this.model.change(mutator => {
      const endLis = range.end.findAncestors(ModelNodeUtils.isListElement);
      const highestEndLi = endLis[endLis.length - 1];
      const lowestEndLi = endLis[0];

      const startLis = range.start.findAncestors(ModelNodeUtils.isListElement);
      const highestStartLi = startLis[startLis.length - 1];
      const lowestStartLi = startLis[0];

      // Node to stop splitting.
      // If position is inside a list, this is the grandparent of the highest li
      // (so that the parent ul will still get split).
      // If position is not in a list, we shouldn't split at all, so take the parent of the position.
      const endLimit = highestEndLi?.parent?.parent ?? range.end.parent;
      const startLimit = highestStartLi?.parent?.parent ?? range.start.parent;

      // Position to start splitting.
      // If inside of a list, take the position before or after the lowest li
      // (aka the first when walking up the ancestor line).
      // If not inside a list, we shouldn't split at all, so just use the position.
      // In combination with the limit above this will cause us not to split.
      const endSplit = lowestEndLi ? ModelPosition.fromAfterNode(lowestEndLi) : range.end;
      const startSplit = lowestStartLi ? ModelPosition.fromBeforeNode(lowestStartLi) : range.start;

      // Split the surrounding lists, such that everything before and after the original range
      // remains a valid list with the same structure.
      // Resulting range contains everything in between.
      const newRange = mutator.splitRangeUntilElements(new ModelRange(startSplit, endSplit), startLimit, endLimit);

      // We walk over all nodes here cause we also want to capture all textnodes that
      // were inside the split so we can set the resulting range properly.
      const nodeWalker = new ModelTreeWalker({
        range: newRange,
      });

      // Consuming here so we can modify without interfering with the walking.
      const nodesInRange = [...nodeWalker];
      const unwrappedNodes = [];
      let resultRange;
      for (const node of nodesInRange) {
        if (ModelNodeUtils.isListRelated(node)) {
          resultRange = mutator.unwrap(node, true);
        } else if (ModelNode.isModelText(node)) {
          unwrappedNodes.push(node);
        }
      }

      // We can be confident that we need the first and last text node here,
      // because the tree walker always walks in document order.
      if (unwrappedNodes.length) {
        const start = ModelPosition.fromBeforeNode(unwrappedNodes[0]);
        const end = ModelPosition.fromAfterNode(unwrappedNodes[unwrappedNodes.length - 1]);
        this.model.selectRange(new ModelRange(start, end));
      } else if (resultRange) {
        this.model.selectRange(resultRange);
      } else {
        throw new SelectionError("No sensible selection possible");
      }
    });
  }
}
