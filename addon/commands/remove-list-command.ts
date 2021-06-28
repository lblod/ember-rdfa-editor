import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {elementHasType} from "@lblod/ember-rdfa-editor/model/util/predicate-utils";
import {listTypes} from "@lblod/ember-rdfa-editor/model/util/constants";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";

export default class RemoveListCommand extends Command {
  name = "remove-list";

  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(selection: ModelSelection = this.model.selection): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const range = selection.lastRange;

    this.model.change(mutator => {

      const endLis = range.end.findAncestors(elementHasType("li"));
      const highestEndLi = endLis[endLis.length - 1];
      const lowestEndLi = endLis[0];

      const startLis = range.start.findAncestors(elementHasType("li"));
      const highestStartLi = startLis[startLis.length - 1];
      const lowestStartLi = startLis[0];

      // node to stop splitting
      // if position is inside a list, this is the grandparent of the highest li (so that the parent
      // ul will still get split)
      // if position is not in a list, we shouldn't split at all, so take the parent of the position
      const endLimit = highestEndLi?.parent?.parent ?? range.end.parent;
      const startLimit = highestStartLi?.parent?.parent ?? range.start.parent;

      // position to start splitting
      // if inside of a list, take the position before or after the lowest li (aka the first
      // when walking up the ancestor line
      // if not inside a list, we shouldn't split at all so just use the position
      // in combination with the limit above this will cause us not to split
      const endSplit = lowestEndLi ? ModelPosition.fromAfterNode(lowestEndLi) : range.end;
      const startSplit = lowestStartLi ? ModelPosition.fromBeforeNode(lowestStartLi) : range.start;


      // split the surrounding lists such that everything before and after the original range
      // remains a valid list with the same structure
      // resulting range contains everything in between
      const newRange = mutator.splitRangeUntilElements(new ModelRange(startSplit, endSplit), startLimit, endLimit);

      // we walk over all nodes here cause we also want to capture all textnodes that
      // were inside the split so we can set the resulting range properly
      const nodeWalker = new ModelTreeWalker({
        range: newRange,
      });
      // consuming here so we can modify without interfering with the walking
      const nodesInRange = [...nodeWalker];
      const unwrappedNodes = [];
      let resultRange;
      for (const node of nodesInRange) {
        if (ModelNode.isModelElement(node) && listTypes.has(node.type)) {
          resultRange = mutator.unwrap(node, true);
        } else if (ModelNode.isModelText(node)) {
          unwrappedNodes.push(node);
        }
      }
      // we can be confident that we need the first and last textnode here
      // because the treewalker always walks in document order
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
