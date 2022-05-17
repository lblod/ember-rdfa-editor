import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import {
  IllegalExecutionStateError,
  MisbehavedSelectionError,
  NoParentError,
  TypeAssertionError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelRangeUtils from '@lblod/ember-rdfa-editor/model/util/model-range-utils';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';

export interface IndentListCommandArgs {
  range?: ModelRange | null;
}
export default class IndentListCommand
  implements Command<IndentListCommandArgs, void>
{
  name = 'indent-list';

  canExecute(
    { state }: CommandContext,
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
      if (!li || li.index === 0) {
        return false;
      }
    }

    return true;
  }

  @logExecute
  execute(
    { state, dispatch }: CommandContext,
    { range = state.selection.lastRange }: IndentListCommandArgs
  ): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }
    const tr = state.createTransaction();

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

      if (!li.parent) {
        throw new NoParentError();
      }

      const parentInSet = setsToIndent.get(li.parent);
      if (parentInSet) {
        parentInSet.push(li);
      } else {
        setsToIndent.set(li.parent, [li]);
      }
    }

    for (const [parent, lis] of setsToIndent.entries()) {
      // First li of (nested) list can never be selected here, so previousSibling is always another li.
      const newParent = lis[0].previousSibling;
      if (!newParent || !ModelNode.isModelElement(newParent)) {
        throw new IllegalExecutionStateError(
          "First selected li doesn't have previous sibling"
        );
      }

      for (const li of lis) {
        tr.deleteNode(li);
      }

      //First check for already existing sublist on the new parent
      //If it exists, just add the elements to it, otherwise create a new sublist
      const possibleNewList = this.hasSublist(newParent);
      if (possibleNewList) {
        tr.insertAtPosition(
          ModelPosition.fromInElement(
            possibleNewList,
            possibleNewList.getMaxOffset()
          ),
          ...lis
        );
      } else {
        const newList = new ModelElement(parent.type);
        newList.appendChildren(...lis);
        tr.insertAtPosition(
          ModelPosition.fromInElement(newParent, newParent.getMaxOffset()),
          newList
        );
      }
    }
    dispatch(tr);
  }

  hasSublist(listElement: ModelElement): ModelElement | undefined {
    const children = listElement.children;
    for (const child of children)
      if (ModelNodeUtils.isListContainer(child)) return child;
    return undefined;
  }
}
