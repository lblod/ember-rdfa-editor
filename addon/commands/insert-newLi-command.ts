import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import ModelText from "../model/model-text";
import {MisbehavedSelectionError, NoParentError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import { INVISIBLE_SPACE} from "../model/util/constants";


export default class InsertNewLiCommand extends Command {
  name = "insert-newLi";

  constructor(model: Model) {
    super(model);
  }

  canExecute(selection: ModelSelection = this.model.selection): boolean{
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const commonAncestor=selection.getCommonAncestor().parent;
    if(commonAncestor?.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='ul' || node.type=='ol'), true)){
      return true;
    }
    return false;
  }
  execute(): void {
    const selection=this.model.selection;
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const selectionStart = selection.lastRange.start;
    const selectionEnd = selection.lastRange.end;
    const startPos = selectionStart.parentOffset;
    const endPos = selectionEnd.parentOffset;

    const selectedIterator = selection.findAllInSelection({});

    if (!selectedIterator) {
      // should be impossible
      throw new SelectionError("couldn't get iterator");
    }

    const selected = Array.from(selectedIterator);
    // get the first and last textnodes of the selection
    const firstText = selected.find(ModelNode.isModelText);
    const lastText = selected.reverse().find(ModelNode.isModelText);

    if (!firstText || !lastText) {
      throw new SelectionError("No text nodes in selection");
    }

    //get the first and last direct parent
    const firstParentLi=firstText?.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='li'), false);
    const lastParentLi=lastText?.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='li'), false);


    // split the node at the start of the selection
    const {left: leftOfStart, right: rightOfStart} = firstText.split(startPos);
    // split the node at the end of the selection
    const {left: leftOfEnd, right: rightOfEnd} = lastText.split(endPos);

    const leftParent = leftOfStart.parent;
    if (!leftParent) {
      throw new NoParentError();
    }

    //handle zero length selection
    if(selectionStart===selectionEnd){
      this.insertNewLi(firstText, startPos);
    }
    //handle long selection of a single text item
    else if(selected.length===1){
      //get the selected text
      const rightSplit=rightOfStart.split(endPos-leftOfStart.length);
      const selectedText=rightSplit.left;
      //get the text thats going to be moved to the new li
      const textTobeMoved=rightSplit.right;

      //remove selected text
      this.model.removeModelNode(selectedText);
      //get the split position
      const position=leftOfStart.length-1;
      //stich texts together
      leftOfStart.content+=textTobeMoved.content;
      //remove unused split
      this.model.removeModelNode(textTobeMoved);
      //call function
      this.insertNewLi(leftOfStart, position+1);
    }
    //selected single li case but might have multiple elements
    else if(firstParentLi==lastParentLi){
      this.deleteSelection(leftOfStart, leftOfEnd);
      const position=leftOfStart.length-1;
      this.insertNewLi(leftOfStart, position+1);
    }
    //handle multiple selected elems
    else{

      this.deleteRight(rightOfStart);
      this.deleteLeft(leftOfEnd);

      const newLi=new ModelElement('li');
      const newText=new ModelText(INVISIBLE_SPACE);
      newLi.addChild(newText);

      firstParentLi.parent.addChild(newLi, firstParentLi?.index+1);

      // loop over selected elements and remove the ones that are not ancestors of the
      // textnodes to the left and right of the selection
      for (const selectedItem of selected) {
        if (selectedItem !== firstText && selectedItem !== lastText) {
          //TODO: this query or its inverse should become a method on a modelnode
          if (!leftOfStart.findAncestor(node => node === selectedItem, true) &&
            !rightOfEnd.findAncestor(node => node === selectedItem, true)) {
            this.model.removeModelNode(selectedItem);
          }
        }
      }
      this.model.selection.collapseOn(newText, 0);
    }
    this.model.write();
  }

  //split text node and walk up and delete all siblings
  insertNewLi(text:ModelText, splitPosition: number):void{
    //split the text and get path to the left element to find the copy later
    const split=text.split(splitPosition);
    const leftTextPath=split.left.getIndexPath();
    //find closest ancestor li and ul to first text element also get path to li
    const firstParentLi=split.left.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='li'), false)!;
    if(!firstParentLi){
      throw new Error('undable to find parent li')
    }
    const firstLiPath=firstParentLi.getIndexPath();
    const firstParentUl=firstParentLi.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='ul' || node.type=='ol'), false)!;
    // duplicate the li
    const newLi=firstParentLi?.clone();
    firstParentUl.addChild(newLi, firstParentLi.index+1);
    //find where the new text is located
    const newTextPath=[...leftTextPath];
    newTextPath[firstLiPath.length-1]++;
    //find both text nodes
    const rightSideFirstLi=split.right;
    const leftSideSecondLi=this.getNodeByIndexPath(newTextPath);
    const rightSideSecondLi=leftSideSecondLi.nextSibling;
    //hacky fix for lis not being able to type
    if(rightSideSecondLi.length===0){
      rightSideSecondLi.content=INVISIBLE_SPACE;
    }
    //remove right nodes
    var sibling=rightSideFirstLi;
    this.deleteRight(sibling);
    //remove left siblings
    sibling=leftSideSecondLi;
    this.deleteLeft(sibling);
    this.model.selection.collapseOn(rightSideSecondLi, 0);
  }

  deleteLeft(node: ModelNode): void{
    //make sure the first node is deleted
    let deleteNode=true;
    while(node){
      //stop if we reached the parent li
      if(node.type){
        if(node.type=='li'){
          break;
        }
      }
      if(deleteNode){
        node.parent?.removeChild(node);
      }
      //remove all siblings to the left but keep direct parents
      if(node.previousSibling){
        node=node.previousSibling;
        deleteNode=true;
      }
      else if(node.parent){
        node=node.parent;
        deleteNode=false;
      }
      else{
        break;
      }
    }
  }

  deleteRight(node: ModelNode): void{
    //make sure the first node is deleted
    let deleteNode=true;
    while(node){
      //stop if we reached the parent li
      if(node.type){
        if(node.type=='li'){
          break;
        }
      }
      if(deleteNode){
        node.parent?.removeChild(node);
      }
      //remove all siblings to the left but keep direct parents
      if(node.nextSibling){
        node=node.nextSibling;
        deleteNode=true;
      }
      else if(node.parent){
        node=node.parent;
        deleteNode=false;
      }
      else{
        break;
      }
    }
  }

  deleteSelection(first: ModelNode, last: ModelNode){
    //make sure the first node is deleted
    let node=last;
    let deleteNode=true;
    while(node){
      //stop if we reached the first node
      if(node==first){
          break;
      }
      if(deleteNode){
        node.parent?.removeChild(node);
      }
      //remove all siblings to the left but keep direct parents
      if(node.previousSibling){
        node=node.previousSibling;
        deleteNode=true;
      }
      else if(node.parent){
        node=node.parent;
        deleteNode=false;
      }
      else{
        break;
      }
    }
  }


  //i think this is usefull overall and should be moved somewhere
  getNodeByIndexPath(path: number[]):ModelNode{
    const root=this.model.rootModelNode;
    var result=root;
    for(let i=0; i<path.length; i++){
      //incase a selection gets passed
      if(i==path.length-1 && result.modelNodeType=="TEXT"){
        return result;
      }
      result=result.children[path[i]];
    }
    return result;
  }

}
