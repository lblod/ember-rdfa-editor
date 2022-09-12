import Command, { CommandContext } from './command';
import {
  MisbehavedSelectionError,
  SelectionError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import ModelTreeWalker from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeList: RemoveListCommand;
  }
}
export interface RemoveListCommandArgs {
  range?: ModelRange | null;
}

export default class RemoveListCommand
  implements Command<RemoveListCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }
  @logExecute
  execute(
    { transaction }: CommandContext,
    {
      range = transaction.workingCopy.selection.lastRange,
    }: RemoveListCommandArgs
  ): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }
    transaction.deepClone();
    const clonedRange = transaction.cloneRange(range);

    const endLis = clonedRange.end.findAncestors(ModelNodeUtils.isListElement);
    const highestEndLi = endLis[endLis.length - 1];
    const lowestEndLi = endLis[0];

    const startLis = clonedRange.start.findAncestors(
      ModelNodeUtils.isListElement
    );
    const highestStartLi = startLis[startLis.length - 1];
    const lowestStartLi = startLis[0];

    // Node to stop splitting.
    // If position is inside a list, this is the grandparent of the highest li
    // (so that the parent ul will still get split).
    // If position is not in a list, we shouldn't split at all, so take the parent of the position.
    const endLimit = highestEndLi?.parent?.parent ?? clonedRange.end.parent;
    const startLimit =
      highestStartLi?.parent?.parent ?? clonedRange.start.parent;

    // Position to start splitting.
    // If inside of a list, take the position before or after the lowest li
    // (aka the first when walking up the ancestor line).
    // If not inside a list, we shouldn't split at all, so just use the position.
    // In combination with the limit above this will cause us not to split.
    const endSplit = lowestEndLi
      ? ModelPosition.fromAfterNode(lowestEndLi)
      : clonedRange.end;
    const startSplit = lowestStartLi
      ? ModelPosition.fromBeforeNode(lowestStartLi)
      : clonedRange.start;

    // Split the surrounding lists, such that everything before and after the original range
    // remains a valid list with the same structure.
    // Resulting range contains everything in between.
    const newRange = transaction.splitRangeUntilElements(
      new ModelRange(startSplit, endSplit),
      startLimit,
      endLimit
    );

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
        resultRange = transaction.unwrap(node, true);
      } else if (ModelNode.isModelText(node)) {
        unwrappedNodes.push(node);
      }
    }

    // We can be confident that we need the first and last text node here,
    // because the tree walker always walks in document order.
    if (unwrappedNodes.length) {
      const start = ModelPosition.fromBeforeNode(unwrappedNodes[0]);
      const end = ModelPosition.fromAfterNode(
        unwrappedNodes[unwrappedNodes.length - 1]
      );
      transaction.selectRange(new ModelRange(start, end));
    } else if (resultRange) {
      transaction.selectRange(resultRange);
    } else {
      throw new SelectionError('No sensible selection possible');
    }
  }
}
