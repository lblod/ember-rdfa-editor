import Command, { CommandContext } from './command';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import { modelPosToSimplePos } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import GenTreeWalker from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';

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
    const endLimit =
      highestEndLi
        ?.getParent(transaction.currentDocument)
        ?.getParent(transaction.currentDocument) ?? clonedRange.end.parent;
    const startLimit =
      highestStartLi
        ?.getParent(transaction.currentDocument)
        ?.getParent(transaction.currentDocument) ?? clonedRange.start.parent;

    // Position to start splitting.
    // If inside of a list, take the position before or after the lowest li
    // (aka the first when walking up the ancestor line).
    // If not inside a list, we shouldn't split at all, so just use the position.
    // In combination with the limit above this will cause us not to split.
    const endSplit = lowestEndLi
      ? ModelPosition.fromAfterNode(transaction.currentDocument, lowestEndLi)
      : clonedRange.end;
    const startSplit = lowestStartLi
      ? ModelPosition.fromBeforeNode(transaction.currentDocument, lowestStartLi)
      : clonedRange.start;

    // Split the surrounding lists, such that everything before and after the original range
    // remains a valid list with the same structure.
    // Resulting range contains everything in between.
    const newRange = transaction.splitRangeUntilElements(
      new ModelRange(startSplit, endSplit),
      startLimit,
      endLimit
    );

    transaction.printDebugInfo();
    // We walk over all nodes here cause we also want to capture all textnodes that
    // were inside the split so we can set the resulting range properly.
    const nodeWalker = GenTreeWalker.fromRange({
      range: newRange,
      filter: toFilterSkipFalse<ModelElement>(ModelNodeUtils.isListRelated),
    });

    // Consuming here so we can modify without interfering with the walking.
    const nodesInRange = [...nodeWalker.nodes()];
    const positions = nodesInRange.map((node) =>
      modelPosToSimplePos(
        ModelPosition.fromBeforeNode(transaction.currentDocument, node)
      )
    );
    const beforeUnwrapState = transaction.workingCopy;
    if (positions.length) {
      transaction.printDebugInfo();
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const mappedPos = transaction.mapPosition(pos, {
          fromState: beforeUnwrapState,
        });
        transaction.unwrap(mappedPos, true);
        transaction.printDebugInfo();
      }
    }
    const finalRange = transaction.mapModelRange(range);
    transaction.selectRange(finalRange);
  }
}
