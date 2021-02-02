import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {listTypes} from "@lblod/ember-rdfa-editor/model/util/constants";

export default class RemoveListCommand extends Command {
  name = "remove-list";

  constructor(model: Model) {
    super(model);
  }

  execute(selection: ModelSelection = this.model.selection) {
    if(!ModelSelection.isWellBehaved(selection)) {

      throw new MisbehavedSelectionError();
    }
    const anchorNode = selection.lastRange.start.parent;
    const focusNode = selection.lastRange.end.parent;

    const listNodesIterator = selection.findAllInSelection({
      filter: ModelNode.isModelElement,
      predicate: (node: ModelElement) => node.type === "li"
    });

    if (!listNodesIterator) {
      throw new SelectionError('The selection is not in a list');
    }

    for (const li of listNodesIterator) {
      while (li.findAncestor(node => ModelNode.isModelElement(node) && listTypes.has(node.type), false)) {
        li.parent?.split(li.index! + 1);
        li.parent?.split(1);
        const oldParent = li.promote(true);
        if(listTypes.has(oldParent.type) && !oldParent.hasVisibleText()) {
          this.model.removeModelNode(oldParent);
        }
      }
      li.unwrap();

    }

    this.model.write();
    this.model.readSelection();
    return;

  }

}
