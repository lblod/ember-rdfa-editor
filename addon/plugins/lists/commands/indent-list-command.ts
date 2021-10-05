import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import {
  IllegalExecutionStateError,
  MisbehavedSelectionError,
  NoParentError,
  TypeAssertionError
} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import ListCleaner from "@lblod/ember-rdfa-editor/model/cleaners/list-cleaner";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/util/model-range-utils"
import ModelNodeUtils from "@lblod/ember-rdfa-editor/util/model-node-utils"
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";

export default class IndentListCommand extends Command {
  name = "indent-list";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    const treeWalker = ModelRangeUtils.findModelNodes(range, ModelNodeUtils.isListElement);
    for (const li of treeWalker) {
      if (!li || li.index === 0) {
        return false;
      }
    }

    return true;
  }

  @logExecute
  execute(executedBy: string, range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const treeWalker = ModelRangeUtils.findModelNodes(range, ModelNodeUtils.isListElement);
    const setsToIndent = new Map<ModelElement, ModelElement[]>();

    for (const li of treeWalker) {
      if (!ModelNode.isModelElement(li)) {
        throw new TypeAssertionError("Current node is not an element.");
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
        throw new IllegalExecutionStateError("First selected li doesn't have previous sibling");
      }

      for (const li of lis) {
        parent.removeChild(li);
      }

      const newList = new ModelElement(parent.type);
      newList.appendChildren(...lis);
      newParent.addChild(newList);
    }

    const cleaner = new ListCleaner();
    cleaner.clean(range);
    this.model.write(executedBy);
  }
}
