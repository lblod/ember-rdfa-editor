import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import {
  IllegalExecutionStateError,
  MisbehavedSelectionError,
  NoParentError,
  TypeAssertionError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelRangeUtils from '@lblod/ember-rdfa-editor/utils/model-range-utils';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import State from '../core/state';
import unwrap from '@lblod/ember-rdfa-editor/utils/unwrap';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    indentList: IndentListCommand;
  }
}

export interface IndentListCommandArgs {
  range?: ModelRange | null;
}

export default class IndentListCommand
  implements Command<IndentListCommandArgs, void>
{
  canExecute(
    state: State,
    { range = state.selection.lastRange }: IndentListCommandArgs
  ): boolean {
    if (!range) {
      return false;
    }

    const treeWalker = ModelRangeUtils.findModelNodes(
      range,
      ModelNodeUtils.isListElement,
      true,
      false
    );
    for (const li of treeWalker) {
      if (!li || li.getIndex(state.document) === 0) {
        return false;
      }
    }

    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    {
      range = transaction.workingCopy.selection.lastRange,
    }: IndentListCommandArgs
  ): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }
    transaction.deepClone();
    range = transaction.cloneRange(range);

    const treeWalker = ModelRangeUtils.findModelNodes(
      range,
      ModelNodeUtils.isListElement,
      true
    );
    const setsToIndent = new Map<ModelElement, ModelElement[]>();

    for (const li of treeWalker) {
      if (!ModelNode.isModelElement(li)) {
        throw new TypeAssertionError('Current node is not an element.');
      }

      if (!li.getParent(transaction.currentDocument)) {
        throw new NoParentError();
      }

      const parentInSet = setsToIndent.get(
        unwrap(li.getParent(transaction.currentDocument))
      );
      if (parentInSet) {
        parentInSet.push(li);
      } else {
        setsToIndent.set(unwrap(li.getParent(transaction.currentDocument)), [
          li,
        ]);
      }
    }

    for (const [parent, lis] of setsToIndent.entries()) {
      // First li of (nested) list can never be selected here, so previousSibling is always another li.
      const newParent = lis[0].getPreviousSibling(transaction.currentDocument);
      if (!newParent || !ModelNode.isModelElement(newParent)) {
        throw new IllegalExecutionStateError(
          "First selected li doesn't have previous sibling"
        );
      }
      const newParentClone = newParent.clone();

      //First check for already existing sublist on the new parent
      //If it exists, just add the elements to it, otherwise create a new sublist
      const possibleNewList = this.hasSublist(newParentClone);
      if (possibleNewList) {
        possibleNewList.appendChildren(...lis);
      } else {
        const newList = new ModelElement(parent.type);
        newList.appendChildren(...lis);
        newParentClone.appendChildren(newList);
      }
      transaction.replaceNode(newParent, newParentClone);
      for (const li of lis) {
        li.remove(transaction.currentDocument);
      }
    }
    transaction.mapInitialSelectionAndSet('left');
  }

  hasSublist(listElement: ModelElement): ModelElement | undefined {
    const children = listElement.children;
    for (const child of children)
      if (ModelNodeUtils.isListContainer(child)) return child;
    return undefined;
  }
}
