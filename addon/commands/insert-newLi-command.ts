import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import ModelText from "../model/model-text";
import { MisbehavedSelectionError, NoParentError, SelectionError } from "@lblod/ember-rdfa-editor/utils/errors";
import { INVISIBLE_SPACE } from "../model/util/constants";
import ModelTreeWalker, { FilterResult } from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import nodeWalker from "dummy/utils/ce/node-walker";
import { getParentLI } from "../utils/dom-helpers";


export default class InsertNewLiCommand extends Command {
  name = "insert-newLi";

  constructor(model: Model) {
    super(model);
  }

  canExecute(selection: ModelSelection = this.model.selection): boolean {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const commonAncestor = selection.getCommonAncestor().parent;
    if (commonAncestor?.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'ul' || node.type === 'ol'), true)) {
      return true;
    }
    return false;
  }
  getParentLi(node: ModelNode): ModelElement | null {
    const parentLi = node.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'li'), false);
  }
  execute(): void {
    const selection = this.model.selection;
    const range = selection.lastRange;
    const startPosition = range.start;
    const endPosition = range.end;
    const isCollapsed = selection.isCollapsed;

    const maximizedRange = range.getMaximizedRange();

    const selectedIterator = new ModelTreeWalker({
      range: maximizedRange
    });

    const selected = Array.from(selectedIterator);
    //deal with collapsed selection
    if (isCollapsed) {
      this.insertNewLi(startPosition)
    }
    else{
      startPosition.split();
      endPosition.split();

      const first=startPosition.nodeAfter();
      const last=endPosition.nodeBefore();


    }
    this.model.write();
  }
  insertNewLi(position:ModelPosition):void{
    const startPosition=position
    startPosition.split();
    let parentLi;
    let parentUl;
    let parentLiPos;
    let toBeCut = [];
    let newLi = new ModelElement("li");
    let node = startPosition.nodeAfter();
    if (!node) {
      parentLi = startPosition.parent.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'li'), true);
      parentUl = parentLi.parent;
      parentLiPos = parentLi.index;
    }
    else {
      parentLi=node.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'li'), false);
      parentUl = parentLi.parent;
      parentLiPos = parentLi.index;

      while (node) {
        const parent = node.parent;
        toBeCut.push(node);
        if (node.parent.type === "li") {
          break;
        }
        else if (node.nextSibling) {
          node = node.nextSibling;
          this.model.removeModelNode(node);
        }
        else if (node.parent) {
          node = node.parent;
          node.appendChildren(toBeCut);
          toBeCut=[];
          this.model.removeModelNode(node);
        }
      }
      toBeCut.forEach(node => newLi.addChild(node));
    }
    parentUl.addChild(newLi, parentLiPos+1);
  }
}

