import Model from '@lblod/ember-rdfa-editor/model/model';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '../model/model-range';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { MarkSet } from '../model/mark';
import ModelNodeUtils from '../model/util/model-node-utils';
import ModelPosition from '../model/model-position';
import { ImpossibleModelStateError } from '../utils/errors';
import ImmediateModelMutator from '../model/mutators/immediate-model-mutator';
import GenTreeWalker from '../model/util/gen-tree-walker';
import ModelElement from '../model/model-element';
import { toFilterSkipFalse } from '../model/util/model-tree-walker';
import ModelNode from '../model/model-node';

export default class RemoveCommand extends Command {
  name = 'remove';

  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(
    direction: 'left' | 'right',
    range: ModelRange | null = this.model.selection.lastRange
  ) {
    if (!range) {
      return;
    }
    let removeRange = range;
    if (range.collapsed) {
      if (direction === 'left') {
        const newStart = range.start.shiftedVisually(-1);
        const newEnd = range.start;
        removeRange = new ModelRange(newStart, newEnd);
      } else if (direction === 'right') {
        const newEnd = range.start.shiftedVisually(1);
        const newStart = range.start;
        removeRange = new ModelRange(newStart, newEnd);
      }
    }
    this.model.change((mutator) => {
      // we only have to consider ancestors of the end of the range since we always merge
      // towards the left
      // SAFETY: filter guarantees results to be elements
      const lis = [
        ...removeRange.end.parent.findSelfOrAncestors(
          ModelNodeUtils.isListElement
        ),
      ] as ModelElement[];
      const lowestLi = lis[0];
      const highestLi = lis[lis.length - 1];

      let rangeAfterDelete;
      if (highestLi) {
        // Isolate the closest li ancestor of the end of our range
        // so we can safely merge  the remaining content after the end of the range but within the li
        // without destroying the rest of the list
        const { adjustedRange, rightSideOfSplit } = isolateLowestLi(
          mutator,
          highestLi,
          lowestLi,
          removeRange
        );
        // perform the deletion
        rangeAfterDelete = mutator.removeNodes(adjustedRange);
        if (
          rightSideOfSplit &&
          ModelNodeUtils.isListContainer(rightSideOfSplit)
        ) {
          // If we did split inside a nested list, the rightside will
          // now have nested list as the first element, which is not allowed, so we flatten it
          flattenList(mutator, rightSideOfSplit);
        }
        rangeAfterDelete = cleanupRangeAfterDelete(mutator, rangeAfterDelete);
      } else {
        rangeAfterDelete = mutator.removeNodes(removeRange);
      }

      if (rangeAfterDelete.start.parent.length === 0) {
        const finalRange = mutator.insertText(
          rangeAfterDelete,
          '',
          new MarkSet()
        );
        this.model.selectRange(finalRange);
      } else {
        this.model.selectRange(rangeAfterDelete);
      }
    });
  }
}
function isolateLowestLi(
  mutator: ImmediateModelMutator,
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

  const splitPoint = mutator.splitUntilElement(splitPos, topUl.parent);
  const newPos = ModelPosition.fromInNode(endParent, end.parentOffset);
  const adjustedRange = new ModelRange(removeRange.start, newPos);
  const rightSideOfSplit = splitPoint.nodeAfter();
  return { adjustedRange, rightSideOfSplit };
}
function cleanupRangeAfterDelete(
  mutator: ImmediateModelMutator,
  range: ModelRange
): ModelRange {
  const nodeAfter = range.start.nodeAfter();

  if (ModelNodeUtils.isListContainer(nodeAfter)) {
    const rangeAfterCleaning = cleanupListWithoutLis(mutator, nodeAfter);
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
    mutator.moveToPosition(
      ModelRange.fromInNode(highestUl.nextSibling),
      ModelPosition.fromInNode(highestUl, highestUl.getMaxOffset())
    );
    flattenList(mutator, highestUl);
  }
  return range;
}
function findNestedListFromPos(
  pos: ModelPosition,
  inLi: ModelElement
): ModelElement | null {
  return GenTreeWalker.fromRange({
    range: new ModelRange(
      pos,
      ModelPosition.fromInNode(inLi, inLi.getMaxOffset())
    ),
    filter: toFilterSkipFalse(ModelNodeUtils.isListContainer),
  })
    .nodes()
    .next().value;
}
/**
 * Completely flatten a nested list up to the level of the given li container
 */
function flattenList(mutator: ImmediateModelMutator, list: ModelElement) {
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
      const moveRange = mutator.unwrap(list);
      const remainingLi = moveRange.start.parent;
      mutator.moveToPosition(moveRange, targetPos);
      if (!remainingLi.children.length) {
        mutator.deleteNode(remainingLi);
      }
      targetPos = ModelPosition.fromAfterNode(firstLi);
    }
  }
}
function cleanupListWithoutLis(
  mutator: ImmediateModelMutator,
  list: ModelElement
): ModelRange | null {
  if (list.children.filter(ModelNodeUtils.isListElement).length === 0) {
    return mutator.unwrap(list);
  }
  return null;
}
