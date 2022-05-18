import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import {
    IllegalExecutionStateError,
    MisbehavedSelectionError,
    TypeAssertionError
} from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Transaction from '../core/transaction';
import Command, { CommandContext } from './command';

export interface InsertNewLiCommandArgs {
  range?: ModelRange | null;
}

export default class InsertNewLiCommand implements Command<
  InsertNewLiCommandArgs,
  void
> {
  name = 'insert-newLi';

  canExecute(
    { state }: CommandContext,
    { range = state.selection.lastRange }
  ): boolean {
    if (!range) {
      return false;
    }

    return range.hasCommonAncestorWhere(ModelNodeUtils.isListContainer);
  }

  @logExecute
  execute(
    { state, dispatch }: CommandContext,
    { range = state.selection.lastRange }: InsertNewLiCommandArgs
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
    const tr = state.createTransaction();

    // Collapsed selection case
    if (range.collapsed) {
      this.insertLi(tr, range.start);
    }
    // Single li expanded selection case
    else if (startParentLi === endParentLi) {
      tr.insertNodes(range);
      this.insertLi(tr, range.start);
    }
    // Multiple lis selected case
    else {
      const newRange = tr.insertNodes(range);
      tr.selectRange(newRange);
    }
    dispatch(tr);
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

    const liNode = newPosition.nodeAfter();

    if (!liNode || !ModelNodeUtils.isListElement(liNode)) {
      throw new TypeAssertionError('Node right after the cursor is not an li');
    }
    if (liNode.length === 0) {
      tr.insertNodes(
        ModelRange.fromInElement(liNode),
        new ModelText(INVISIBLE_SPACE)
      );
      tr.selectRange(ModelRange.fromInElement(liNode, 1, 1));
    } else {
      tr.selectRange(ModelRange.fromInElement(liNode, 0, 0));
    }
  }
}
