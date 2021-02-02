import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

export default class UnindentListCommand extends Command {
  name: string = "unindent-list";
  constructor(model: Model) {
    super(model);
  }

  execute(selection: ModelSelection = this.model.selection): void {
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
      listItem.unwrap(!listItem.firstChild.isBlock && index !== listNodes.length - 1);
      if(listItem.parent?.type === "ul" || listItem.parent?.type === "ol") {
        listItem.parent?.unwrap();
      }
    }
    this.model.write();
    this.model.readSelection();
  }

}
