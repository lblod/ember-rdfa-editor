import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {listTypes} from "@lblod/ember-rdfa-editor/model/util/constants";
import { defaultPrefixes } from "../config/rdfa";

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


    const first=selected[0];
    const firstText=selected.find(e=>e.modelNodeType=='TEXT');
    const last=selected[selected.length-1];
    const lastText=selected.reverse().find(e=>e.modelNodeType=='TEXT');
    const firstParentLi=firstText?.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='li'), false);
    const lastParentLi=lastText?.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='li'), false);
    const anchorPos=anchor[anchor.length-1];
    const focusPos=focus[focus.length-1];
    const br=new ModelElement('br');
    //handle zero length selection
    if(anchor==focus){
      if(first.modelNodeType=='TEXT'){
        const length=first.length;

        if(length==0 || length==anchorPos){
          first.parent?.addChild(br, first.index+1);
        }
        else{
          const split=first.split(anchorPos);
          split.left.parent.addChild(br, split.left.index+1);
        }
      }
      else if(first.modelNodeType=='ELEMENT' && first.type=='br'){
        first.parent.removeChild(first);
        first.parent.addChild(br, first.index+1);
      }
    }
    //handle long selection of single item
    else if(selected.length==1){
      if(first.modelNodeType=='TEXT'){
        const split=first.split(anchorPos);
        split.left.parent.addChild(br, split.left.index+1);
        const rightSplit=split.right.split(focusPos-split.left.length);

        rightSplit.left.parent.removeChild(rightSplit.left);
      }
      else if(first.modelNodeType=='ELEMENT' && first.type=='br'){
        first.parent?.addChild(br, first.index+1);
        first.parent?.removeChild(first);
      }
    }
    //handle multiple selected elems
    else{
      //find first element that has text
      //split first element and remove right split
      if(first.modelNodeType=='TEXT'){
        if(first.length==anchorPos){
          first.parent.addChild(br, first.index+1);
          first.parent.removeChild(first);
        }
        else{
          const split=first.split(anchorPos);
          split.left.parent.addChild(br, split.left.index+1);
          split.right.parent.removeChild(split.right);
        }
      }
      else if(first.modelNodeType=='ELEMENT' && first.type=='br'){
        first.parent.removeChild(first);
        first.parent.addChild(br, first.index+1);
      }

      //split last element and remove left split
      const last=selected[selected.length-1];
      if(last.modelNodeType=='TEXT'){
        if(last.length==focusPos){
          last.parent.removeChild(last);
        }
        else{
          const split=last.split(focusPos);
          split.right.parent.removeChild(split.left);
        }
      }
      else if(last.modelNodeType=='ELEMENT' && last.type=='br'){
        first.parent.removeChild(first);
      }
      //remove inbetweeen elements
      for(let i=1; i<selected.length-1; i++){
        if(selected[i].parent){
          if(selected[i].modelNodeType=='TEXT'){
            selected[i].parent.removeChild(selected[i]);
          }
        }
      }
    }
    //TODO (sergey):this is a very quick and hacky solution should be rethought
    const cursorPos=br.getIndexPath();
    cursorPos[cursorPos.length-1]+=1;
    selection.anchor.path=cursorPos;
    selection.focus.path=cursorPos;

    this.model.write();
    this.model.readSelection();
    return;
  }
}
