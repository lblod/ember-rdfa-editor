import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Transaction from '../core/state/transaction';
import { MarkSet } from '../model/marks/mark';
import ModelElement from '../model/nodes/model-element';
import ModelNode from '../model/nodes/model-node';
import ModelPosition from '../model/model-position';
import ModelRange from '../model/model-range';
import GenTreeWalker from '../utils/gen-tree-walker';
import ModelNodeUtils from '../utils/model-node-utils';
import { toFilterSkipFalse } from '../utils/model-tree-walker';
import { ImpossibleModelStateError } from '../utils/errors';
declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    remove: RemoveCommand;
  }
}

export interface RemoveCommandArgs {
  range: ModelRange;
}
export default class RemoveCommand implements Command<RemoveCommandArgs, void> {
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ transaction }: CommandContext, { range }: RemoveCommandArgs): void {
    // we only have to consider ancestors of the end of the range since we always merge
    // towards the left
    // SAFETY: filter guarantees results to be elements
    const lis = [
      ...range.end.parent.findSelfOrAncestors(ModelNodeUtils.isListElement),
    ] as ModelElement[];
    const lowestLi = lis[0];
    const highestLi = lis[lis.length - 1];

    let rangeAfterDelete;
    if (highestLi) {
      // Isolate the closest li ancestor of the end of our range
      // so we can safely merge  the remaining content after the end of the range but within the li
      // without destroying the rest of the list
      const { adjustedRange, rightSideOfSplit } = isolateLowestLi(
        transaction,
        highestLi,
        lowestLi,
        range
      );
      // perform the deletion
      rangeAfterDelete = transaction.removeNodes(adjustedRange);
      if (
        rightSideOfSplit &&
        ModelNodeUtils.isListContainer(rightSideOfSplit)
      ) {
        // If we did split inside a nested list, the rightside will
        // now have nested list as the first element, which is not allowed, so we flatten it
        flattenList(transaction, rightSideOfSplit);
      }
      rangeAfterDelete = cleanupRangeAfterDelete(transaction, rangeAfterDelete);
    } else {
      rangeAfterDelete = transaction.removeNodes(range);
    }

    if (rangeAfterDelete.start.parent.length === 0) {
      const finalRange = transaction.insertText({
        range: rangeAfterDelete,
        text: '',
        marks: new MarkSet(),
      });
      transaction.selectRange(finalRange);
    } else {
      transaction.selectRange(rangeAfterDelete);
    }
    // this.model.emitSelectionChanged();
  }
}
function isolateLowestLi(
  tr: Transaction,
  highestLi: ModelElement,
  lowestLi: ModelElement,
  removeRange: ModelRange
): { adjustedRange: ModelRange; rightSideOfSplit: ModelNode | null } {
  const { end } = removeRange;
  const topUl = highestLi.parent;
  if (!topUl) {
    throw new ImpossibleModelStateError('Li cannot be root');
  }
  if (!topUl.parent) {
    throw new ImpossibleModelStateError('Ul cannot be root');
  }
  const endParent = end.parent;

  let splitPos = ModelPosition.fromAfterNode(lowestLi);
  const nestedUl = findNestedListFromPos(end, lowestLi);

  if (nestedUl) {
    splitPos = ModelPosition.fromBeforeNode(nestedUl);
  }

  const splitPoint = tr.splitUntilElement(splitPos, topUl.parent);
  const newPos = ModelPosition.fromInNode(endParent, end.parentOffset);
  const start = removeRange.start;

  const adjustedRange = new ModelRange(start, newPos);
  const rightSideOfSplit = splitPoint.nodeAfter();
  return { adjustedRange, rightSideOfSplit };
}
function cleanupRangeAfterDelete(
  tr: Transaction,
  range: ModelRange
): ModelRange {
  const nodeAfter = range.start.nodeAfter();

  if (ModelNodeUtils.isListContainer(nodeAfter)) {
    const rangeAfterCleaning = cleanupListWithoutLis(tr, nodeAfter);
    if (rangeAfterCleaning) {
      return rangeAfterCleaning;
    }
  }
  // SAFETY: filter guarantees modelelement
  const highestUl = (
    range.start.parent.findSelfOrAncestors(
      ModelNodeUtils.isListContainer
    ) as Generator<ModelElement, void, void>
  ).next().value;
  if (highestUl && ModelNodeUtils.isListContainer(highestUl.nextSibling)) {
    tr.moveToPosition(
      ModelRange.fromInNode(highestUl.nextSibling),
      ModelPosition.fromInNode(highestUl, highestUl.getMaxOffset())
    );
    flattenList(tr, highestUl);
  }
  return range;
}
function findNestedListFromPos(
  pos: ModelPosition,
  inLi: ModelElement
): ModelNode | null {
  return GenTreeWalker.fromRange({
    range: new ModelRange(
      pos,
      ModelPosition.fromInNode(inLi, inLi.getMaxOffset())
    ),
    filter: toFilterSkipFalse<ModelNode>(ModelNodeUtils.isListContainer),
  }).nextNode();
}
/**
 * Completely flatten a nested list up to the level of the given li container
 */
function flattenList(tr: Transaction, list: ModelElement) {
  const firstLi = list.children.find(ModelNodeUtils.isListElement);
  if (firstLi) {
    // SAFETY: the filter guarantees nodes are elements
    const nestedLists = [
      ...GenTreeWalker.fromSubTree({
        root: firstLi,
        filter: toFilterSkipFalse((node: ModelNode) =>
          ModelNodeUtils.isListContainer(node)
        ),
      }).nodes(),
    ] as ModelElement[];
    let targetPos = ModelPosition.fromAfterNode(firstLi);

    for (const list of nestedLists) {
      const moveRange = tr.unwrap(list);
      const remainingLi = moveRange.start.parent;
      tr.moveToPosition(moveRange, targetPos);
      if (!remainingLi.children.length) {
        tr.deleteNode(remainingLi);
      }
      targetPos = ModelPosition.fromAfterNode(firstLi);
    }
  }
}
function cleanupListWithoutLis(
  tr: Transaction,
  list: ModelElement
): ModelRange | null {
  if (list.children.filter(ModelNodeUtils.isListElement).length === 0) {
    return tr.unwrap(list);
  }
  return null;
}
