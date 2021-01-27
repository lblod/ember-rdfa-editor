import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";

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

    const listContainers = new Set(["li"]);

    const listNodesIterator = selection.findAllInSelection({
      filter: ModelNode.isModelElement,
      predicate: (node: ModelElement) => listContainers.has(node.type)
    });
    if (!listNodesIterator) {
      throw new SelectionError('The selection is not in a list');
    }
    const listNodes = Array.from(listNodesIterator);

      const anchorLi = anchorNode?.findAncestor(node => ModelNode.isModelElement(node) && node.type === "li");
      const focusLi = focusNode?.findAncestor(node => ModelNode.isModelElement(node) && node.type === "li");

      if (anchorLi && anchorLi.index! > 0) {
        anchorLi.parent!.split(anchorLi.index!);
      }

      if (focusLi && focusLi.index! < focusLi.parent!.children.length - 1) {
        focusLi.parent?.split(focusLi.index! + 1);
      }

    for (const [index, listItem] of listNodes.entries()) {
      //unwrap lists
      listItem.unwrap(index !== listNodes.length - 1);
      if(listItem.parent?.type === "ul" || listItem.parent?.type === "ol") {
        listItem.parent?.unwrap();
      }
    }
    this.model.write();
    return;

  }

}
