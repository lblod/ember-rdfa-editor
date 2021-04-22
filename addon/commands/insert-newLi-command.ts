import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import ModelText from "../model/model-text";
import { MisbehavedSelectionError, NoParentError, NotImplementedError, SelectionError } from "@lblod/ember-rdfa-editor/utils/errors";
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
    else {
      startPosition.split();
      endPosition.split();

      const first = startPosition.nodeAfter();
      const last = endPosition.nodeBefore();


    }
    this.model.write();
  }

  //core algorithm
  insertNewLi(position: ModelPosition): void {
    //split the nodes at position
    position.split();

    //variable initialization
    let parentLi;
    let parentUl;
    let parentLiPos;
    let newLiNodes=[];
    let toBeInserted:ModelNode[]=[];
    let newLi = new ModelElement('li');
    let node = position.nodeAfter();

    //try to find the first node we can copy if there is no nodeAfter
    if (!node) {
      let searchVar = position.nodeBefore();
      if (searchVar && searchVar.parent) {
        searchVar = searchVar.parent;
      }
      while (searchVar) {
        if (ModelNode.isModelElement(searchVar) && searchVar.type === "li") {
          break;
        }
        else if (searchVar.nextSibling) {
          searchVar = searchVar.nextSibling;
          node = searchVar;
          break;
        }
        else if (searchVar.parent) {
          searchVar = searchVar.parent;
        }
      }

      //assume that the cursor is at the end
      if (!node) {
        node = position.nodeBefore();
        if (!node) {
          throw new Error("couldn't find a node to work with")
        }

        //find parent li and ul/ol as well as parent li position
        parentLi = node.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'li'), false);
        if (!parentLi) {
          throw new Error("couldn't find the parent li");
        }
        parentUl = parentLi.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'ul' || node.type === 'ol'), false);
        if (!parentUl) {
          throw new Error("couldn't find the parent ul/ol");
        }
        parentLiPos = parentLi.index;
        if (!parentLiPos) {
          throw new Error("couldn't find the parent li position")
        }

        //add empty li to the parent ul
        parentUl.addChild(newLi, parentLiPos + 1);
        return;
      }
    }

    //find parent li and ul/ol as well as parent li position
    parentLi = node.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'li'), false);
    if (!parentLi) {
      throw new Error("couldn't find the parent li");
    }
    parentUl = parentLi.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'ul' || node.type === 'ol'), false);
    if (!parentUl) {
      throw new Error("couldn't find the parent ul/ol");
    }
    parentLiPos = parentLi.index;
    if (parentLiPos===null) {
      throw new Error("couldn't find the parent li position")
    }
    newLiNodes.push({ node: node, operation: 'cut' });
    //walk up the nodes and find things to cut/copy to a new li
    while (node) {
      //cut siblings and siblings of parents
      if (node.nextSibling) {
        node = node.nextSibling;
        newLiNodes.push({ node: node, operation: 'cut' });
      }
      //only copy direct parents only
      //and put siblings you cut into them
      else if (node.parent) {
        if (ModelNode.isModelElement(node.parent) && node.parent.type === "li") {
          break;
        }
        node = node.parent;
        newLiNodes.push({ node: node, operation: 'copy' });
      }
      else{
        throw new Error('something went horribly wrong when walking up a tree');
      }
    }

    //update the existing list
    newLiNodes.forEach(e => {
      if (e.operation === 'cut') {
        this.model.removeModelNode(e.node);
        toBeInserted.push(e.node);
      }
      if (e.operation === 'copy') {
        const copy = e.node.clone();
        copy.appendCildren(...toBeInserted);
        toBeInserted = [];
        toBeInserted.push(copy);
      }
    });

    newLi.appendChildren(...toBeInserted);
    parentUl.addChild(newLi, parentLiPos + 1);
  }
}

