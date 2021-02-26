import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {listTypes} from "@lblod/ember-rdfa-editor/model/util/constants";
import { defaultPrefixes } from "../config/rdfa";
import { removeNode } from "../utils/dom-helpers";

export default class InsertNewLineCommand extends Command {
  name = "insert-newLine";

  constructor(model: Model) {
    super(model);
  }
  canExecute(selection: ModelSelection = this.model.selection): bool{
    return true;
  }
  execute(selection: ModelSelection = this.model.selection): void {
    const anchor=selection.lastRange.start.path;
    const focus=selection.lastRange.end.path;

    const selectedIterator = selection.findAllInSelection({});
    if(!selectedIterator){
      return;
    }

    const selected = Array.from(selectedIterator);

    const firstText=selected.find(e=>e.modelNodeType=='TEXT');
    const lastText=selected.reverse().find(e=>e.modelNodeType=='TEXT');
    const anchorPos=anchor[anchor.length-1];
    const focusPos=focus[focus.length-1];
    const br=new ModelElement('br');
    let cursorPos=[0];
    //handle zero length selection
    if(anchor==focus){
        const split=firstText.split(anchorPos);
        split.left.parent.addChild(br, split.left.index+1);
        cursorPos=[...split.right.getIndexPath()];
        cursorPos.push(0);
    }
    //handle long selection of single item
    else if(selected.length==1){
      const split=firstText.split(anchorPos);
      split.left.parent.addChild(br, split.left.index+1);
      const rightSplit=split.right.split(focusPos-split.left.length);
      rightSplit.left.parent.removeChild(rightSplit.left);
      cursorPos=[...rightSplit.right.getIndexPath()];
      cursorPos.push(0);
    }
    //handle multiple selected elems
    else{
      debugger;

      const firstSplit=firstText.split(anchorPos);
      firstSplit.right.parent.removeChild(firstSplit.right);
      const lastSplit=lastText.split(focusPos);
      lastSplit.left.parent.removeChild(lastSplit.left);

      for(let i=0; i<selected.length; i++){
        if(firstSplit.left.findAncestor(node => node==selected[i], false) ||
           lastSplit.right.findAncestor(node => node==selected[i], false) ||
           firstText==selected[i] ||
           lastText==selected[i] ||
           firstSplit.left==selected[i] ||
           firstSplit.right==selected[i])
        {
          //do nothing
        }
        else{
          selected[i].parent?.removeChild(selected[i]);
        }
      }
      const cursorPos=[...lastSplit.right.getIndexPath()];
      cursorPos.push(0);
      // //find first element that has text
      // //split first element and remove right split
      // if(first.modelNodeType=='TEXT'){
      //   if(first.length==anchorPos){
      //     first.parent.addChild(br, first.index+1);
      //     first.parent.removeChild(first);
      //   }
      //   else{
      //     const split=first.split(anchorPos);
      //     split.left.parent.addChild(br, split.left.index+1);
      //     split.right.parent.removeChild(split.right);
      //   }
      // }
      // else if(first.modelNodeType=='ELEMENT' && first.type=='br'){
      //   first.parent.removeChild(first);
      //   first.parent.addChild(br, first.index+1);
      // }

      // //split last element and remove left split
      // const last=selected[selected.length-1];
      // if(last.modelNodeType=='TEXT'){
      //   if(last.length==focusPos){
      //     last.parent.removeChild(last);
      //   }
      //   else{
      //     const split=last.split(focusPos);
      //     split.right.parent.removeChild(split.left);
      //   }
      // }
      // else if(last.modelNodeType=='ELEMENT' && last.type=='br'){
      //   first.parent.removeChild(first);
      // }
      // //remove inbetweeen elements
      // for(let i=1; i<selected.length-1; i++){
      //   if(selected[i].parent){
      //     if(selected[i].modelNodeType=='TEXT'){
      //       selected[i].parent.removeChild(selected[i]);
      //     }
      //   }
      // }
    }



    selection.anchor.path=cursorPos;
    selection.focus.path=cursorPos;

    this.model.write();
    this.model.readSelection();
    return;
  }
  // deleteLeft(node: ModelNode): void{
  //   //make sure the first node is deleted
  //   let deleteNode=true;
  //   while(node){
  //     //stop if we reached the parent li
  //     if(node.type){
  //       if(node.type=='li'){
  //         break;
  //       }
  //     }
  //     if(deleteNode){
  //       node.parent?.removeChild(node);
  //     }
  //     //remove all siblings to the left but keep direct parents
  //     if(node.previousSibling){
  //       node=node.previousSibling;
  //       deleteNode=true;
  //     }
  //     else if(node.parent){
  //       node=node.parent;
  //       deleteNode=false;
  //     }
  //     else{
  //       break;
  //     }
  //   }
  // }

  // deleteRight(node: ModelNode): void{
  //   //make sure the first node is deleted
  //   let deleteNode=true;
  //   while(node){
  //     //stop if we reached the parent li
  //     if(node.type){
  //       if(node.type=='li'){
  //         break;
  //       }
  //     }
  //     if(deleteNode){
  //       node.parent?.removeChild(node);
  //     }
  //     //remove all siblings to the left but keep direct parents
  //     if(node.nextSibling){
  //       node=node.nextSibling;
  //       deleteNode=true;
  //     }
  //     else if(node.parent){
  //       node=node.parent;
  //       deleteNode=false;
  //     }
  //     else{
  //       break;
  //     }
  //   }
  // }
}
