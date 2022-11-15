import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelRangeUtils from '@lblod/ember-rdfa-editor/utils/model-range-utils';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import State from '../core/state';
import unwrap from '@lblod/ember-rdfa-editor/utils/unwrap';
import MapUtils from '@lblod/ember-rdfa-editor/utils/map-utils';

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
    range = transaction.cloneRange(range);
    // TODO rework this command
    const initialRoot = transaction.currentDocument;

    // find all <li> elements in the given range
    const treeWalker = ModelRangeUtils.findModelNodes(
      range,
      ModelNodeUtils.isListElement,
      true
    );
    // a map of all <ul>s in the range onto their <li> children
    const setsToIndent = new Map<ModelElement, ModelElement[]>();

    // build up the map
    for (const li of treeWalker) {
      ModelNode.assertModelElement(li);

      const parent = unwrap(li.getParent(transaction.currentDocument));
      MapUtils.setOrPush(setsToIndent, parent, li);
    }

    for (const [parent, lis] of setsToIndent.entries()) {
      // First li of (nested) list can never be selected here, so previousSibling is always another li.
      // this is because of the canExecute check
      const newParent = unwrap(
        lis[0].getPreviousSibling(transaction.currentDocument)
      );
      ModelNode.assertModelElement(newParent);

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
        const liRange = ModelRange.fromAroundNode(initialRoot, li);
        transaction.delete(transaction.mapModelRange(liRange));
      }
    }
    transaction.mapInitialSelectionAndSet({ startBias: 'left' });
  }

  hasSublist(listElement: ModelElement): ModelElement | undefined {
    const children = listElement.children;
    for (const child of children)
      if (ModelNodeUtils.isListContainer(child)) return child;
    return undefined;
  }
}
