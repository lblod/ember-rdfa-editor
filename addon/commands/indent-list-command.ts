import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {MisbehavedSelectionError, NoParentError} from "@lblod/ember-rdfa-editor/utils/errors";
import ListCleaner from "@lblod/ember-rdfa-editor/model/cleaners/list-cleaner";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import ModelTreeWalker, {toFilterSkipFalse} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default class IndentListCommand extends Command {
  name = "indent-list";

  constructor(model: Model) {
    super(model);
  }

  createTreeWalker(range: ModelRange): ModelTreeWalker {
    // The start of the selected range is inside an li node.
    // In this case, make sure to place the start position of the range before this li node,
    // otherwise the tree walker won't return it.
    //
    // BEFORE:
    // <ul>
    //  <li>list |element one</li>
    //  <li>list element |two</li>
    // </ul>
    //
    // AFTER:
    // <ul>
    //  |<li>list element one</li>
    //  <li>list element |two</li>
    // </ul>
    const startLi = range.start.findAncestors(node => {
      return ModelNode.isModelElement(node) && node.type === "li";
    });

    // Select first li ancestor.
    if (startLi.length > 0) {
      range = new ModelRange(ModelPosition.fromBeforeNode(startLi[0]), range.end);
    }

    return new ModelTreeWalker({
      filter: toFilterSkipFalse(node => {
        return ModelNode.isModelElement(node) && node.type === "li";
      }),
      range: range
    });
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange) {
    if (!range) {
      return false;
    }

    const treeWalker = this.createTreeWalker(range);
    for (const li of treeWalker) {
      if (!li || li.index === 0) {
        return false;
      }
    }

    return true;
  }

  @logExecute
  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const treeWalker = this.createTreeWalker(range);
    const setsToIndent = new Map<ModelElement, ModelElement[]>();

    for (const li of treeWalker) {
      if (!ModelNode.isModelElement(li) || li.type !== "li") {
        throw new Error("Current node is not a list element.");
      }

      const parent = li.parent;
      if (!parent) {
        throw new NoParentError();
      }

      const parentInSet = setsToIndent.get(parent);
      if (parentInSet) {
        parentInSet.push(li);
      } else {
        setsToIndent.set(parent, [li]);
      }
    }

    for (const [parent, lis] of setsToIndent.entries()) {
      // First li of (nested) list can never be selected here, so previousSibling is always another li.
      const newParent = lis[0].previousSibling as ModelElement;
      if (!newParent) {
        throw new Error("First selected li doesn't have previous sibling");
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
    this.model.write();
  }
}
