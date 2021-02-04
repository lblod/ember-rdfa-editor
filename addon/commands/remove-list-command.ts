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
      predicate: (node: ModelElement) => {
        return node.type === "li";
      }
    });

    if (!listNodesIterator) {
      throw new SelectionError('The selection is not in a list');
    }

    for (const li of listNodesIterator) {
      if(li.parent) {
        while (li.findAncestor(node => ModelNode.isModelElement(node) && listTypes.has(node.type), false)) {
          li.isolate();
          this.model.write();
          li.promote(true);
          const nextSibling = li.nextSibling;
          const previousSibling = li.previousSibling;
          if(nextSibling && ModelNode.isModelElement(nextSibling)) {
            if (!nextSibling.hasVisibleText()) {
              this.model.removeModelNode(nextSibling);
            }
          }
          if(previousSibling && ModelNode.isModelElement(previousSibling)){
            if (!previousSibling.hasVisibleText()) {
              this.model.removeModelNode(previousSibling);
            }
          }

        }
      }
      li.parent!.addChild( new ModelElement("br"), li.index! + 1);
      li.unwrap();

    }

    this.model.write();
    this.model.readSelection();
    return;

  }

}
