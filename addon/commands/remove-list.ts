import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import {MisbehavedSelectionError, NoParentError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";

export default class RemoveListCommand extends Command {
  name = "remove-list";

  constructor(model: Model) {
    super(model);
  }

  getListNode(node: ModelNode): ModelElement | null {
    if(ModelElement.isModelElement(node)) {
      const element = node as ModelElement;
      if(element.type === 'ul' || element.type === 'ol') {
        return element;
      }
    }
    if(node.parent) {
      return this.getListNode(node.parent);
    } else {
      return null;
    }
  }

  getListItem(node: ModelNode): ModelElement | null {
    if(ModelElement.isModelElement(node)) {
      const element = node as ModelElement;
      if(element.type === 'li') {
        return element;
      }
    }
    if(node.parent) {
      return this.getListItem(node.parent);
    } else {
      return null;
    }
  }

  execute(selection: ModelSelection = this.model.selection) {
    const commonAncestor = selection.getCommonAncestor()?.parent;
    if(!commonAncestor) throw new MisbehavedSelectionError();

    const listNode = this.getListNode(commonAncestor);
    if(!listNode) throw new SelectionError('The selection is not in a list');

    const anchorNode = selection.anchor?.parent;
    const focusNode = selection.focus?.parent;
    if(!anchorNode || !focusNode) throw new MisbehavedSelectionError();

    const anchorLi = this.getListItem(anchorNode);
    const focusLi = this.getListItem(focusNode);
    if(!anchorLi || !focusLi || anchorLi.index === null || focusLi.index === null) throw new SelectionError('The selection is not in a list');

    const {left: preSelectionNodes, right: rest} = listNode.split(anchorLi.index);
    const {left: selectionNodes, right: postSelectionNodes} = rest.split(focusLi.index + 1);
    const parentDiv = listNode.parent;
    const index = listNode.index;
    if(index === null || !parentDiv) throw new NoParentError();

    parentDiv.removeChild(listNode);

    if(postSelectionNodes && postSelectionNodes.children.length) {
      parentDiv.addChild(postSelectionNodes, index);
    }

    for(const child of selectionNodes.children){
      const newElement = new ModelElement('div');
      const childElement = child as ModelElement;
      newElement.appendChildren(...childElement.children);
      parentDiv?.addChild(newElement, index);
    }

    if(preSelectionNodes && preSelectionNodes.children.length) {
      parentDiv.addChild(preSelectionNodes, index);
    }
    
    this.model.write(parentDiv);

  }
}