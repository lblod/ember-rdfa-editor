import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelText from '@lblod/ember-rdfa-editor/model/nodes/model-text';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import {
  IllegalExecutionStateError,
  MisbehavedSelectionError,
  TypeAssertionError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import State from '../core/state';
import Transaction from '../core/transaction';
import Command, { CommandContext } from './command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    insertNewLi: InsertNewLiCommand;
  }
}
export interface InsertNewLiCommandArgs {
  range?: ModelRange | null;
}

export default class InsertNewLiCommand
  implements Command<InsertNewLiCommandArgs, void>
{
  canExecute(state: State, { range = state.selection.lastRange }): boolean {
    if (!range) {
      return false;
    }

    return range.hasCommonAncestorWhere(ModelNodeUtils.isListContainer);
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    {
      range = transaction.workingCopy.selection.lastRange,
    }: InsertNewLiCommandArgs
  ): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const startParentLi = range.start.findAncestors(
      ModelNodeUtils.isListElement
    )[0];
    const endParentLi = range.end.findAncestors(
      ModelNodeUtils.isListElement
    )[0];

    if (!startParentLi || !endParentLi) {
      throw new IllegalExecutionStateError("Couldn't locate parent lis");
    }

    // Collapsed selection case
    if (range.collapsed) {
      this.insertLi(transaction, range.start);
    }
    // Single li expanded selection case
    else if (startParentLi === endParentLi) {
      transaction.insertNodes(range);
      this.insertLi(transaction, range.start);
    }
    // Multiple lis selected case
    else {
      const newRange = transaction.insertNodes(range);
      transaction.selectRange(newRange);
    }
  }

  private insertLi(tr: Transaction, position: ModelPosition) {
    let newPosition = tr.splitUntil(
      position,
      (node) => ModelNodeUtils.isListContainer(node.parent),
      false
    );
    newPosition = tr.splitUntil(
      newPosition,
      ModelNodeUtils.isListContainer,
      true
    );

    const nodeBefore = newPosition.nodeBefore();
    const nodeAfter = newPosition.nodeAfter();

    if (
      !nodeBefore ||
      !nodeAfter ||
      !ModelNodeUtils.isListElement(nodeBefore) ||
      !ModelNodeUtils.isListElement(nodeAfter)
    ) {
      throw new TypeAssertionError('Node right after the cursor is not an li');
    }
    if (nodeBefore.length === 0) {
      tr.insertNodes(
        ModelRange.fromInElement(nodeBefore),
        new ModelText(INVISIBLE_SPACE)
      );
    }
    if (nodeAfter.length === 0) {
      tr.insertNodes(
        ModelRange.fromInElement(nodeAfter),
        new ModelText(INVISIBLE_SPACE)
      );
      tr.selectRange(ModelRange.fromInElement(nodeAfter, 1, 1));
    } else {
      tr.selectRange(ModelRange.fromInElement(nodeAfter, 0, 0));
    }
  }
}
