import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {NoParentError} from "@lblod/ember-rdfa-editor/utils/errors";

export default class IndentListCommand extends Command {
  name: string = "indent-list";

  constructor(model: Model) {
    super(model);
  }

  canExecute(selection: ModelSelection = this.model.selection) {
    const selectedLIs = selection.findAllInSelection({
      filter: ModelNode.isModelElement,
      predicate: node => node.type === "li"
    });
    if (!selectedLIs) {
      return false;
    }
    for (const li of selectedLIs) {
      if ( li == null || li.index! === 0) {
        return false;
      }
    }
    return true;
  }

  execute(selection: ModelSelection = this.model.selection): void {
    const selectedLIsIterator = selection.findAllInSelection({
      filter: ModelNode.isModelElement,
      predicate: node => node.type === "li"
    });
    if (!selectedLIsIterator) {
      return;
    }
    const selectedLIs = Array.from(selectedLIsIterator);

    const setsToIndent = new Map<ModelElement, ModelElement[]>();

    for (const li of selectedLIs) {
      const parent = li.parent;
      if (!parent) {
        throw new NoParentError();
      }

      if (setsToIndent.has(parent)) {
        setsToIndent.get(parent)!.push(li);
      } else {
        setsToIndent.set(parent, [li]);
      }
    }

    for (const [parent, lis] of setsToIndent.entries()) {
      const insertionIndex = lis[0].index!;
      for (const li of lis) {
        parent.removeChild(li);
      }

      const newParent = new ModelElement("li");
      const newList = new ModelElement(parent.type);
      newParent.addChild(newList);
      newList.appendChildren(...lis);

      parent.addChild(newParent, insertionIndex);
      this.model.write(parent);
    }
  }

}
