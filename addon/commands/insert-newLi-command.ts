import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import ModelText from "../model/model-text";

export default class InsertNewLiCommand extends Command {
  name = "insert-newLi";

  constructor(model: Model) {
    super(model);
  }

  canExecute(selection: ModelSelection = this.model.selection): boolean{
    const commonAncestor=this.getNodeByIndexPath(selection.getCommonAncestor().path);

    if(commonAncestor?.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='ul' || node.type=='ol'), true)){
      return true;
    }

    return false;
  }
  execute(selection: ModelSelection = this.model.selection): void {
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

    // split the node at the start of the selection
    const {left: leftOfStart, right: rightOfStart} = firstText.split(startPos);
    // split the node at the end of the selection
    const {left: leftOfEnd, right: rightOfEnd} = lastText.split(endPos);

    const leftParent = leftOfStart.parent;
    if (!leftParent) {
      throw new NoParentError();
    }
    //handle zero length selection
    if(selectionStart==selectionEnd){
      this.insertNewLi(firstText, startPos);
    }
  }
//     const anchor=selection.lastRange.start.path;
//     const focus=selection.lastRange.end.path;

//     const selectedIterator = selection.findAllInSelection({});
//     if(!selectedIterator){
//       return;
//     }
//     const selected = Array.from(selectedIterator);

//     //utility vars
//     const first=selected[0];
//     const firstText=selected.find(e=>e.modelNodeType=='TEXT');
//     const last=selected[selected.length-1];
//     const lastText=selected.reverse().find(e=>e.modelNodeType=='TEXT');
//     const firstParentLi=firstText?.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='li'), false);
//     const lastParentLi=lastText?.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='li'), false);
//     const newLi=new ModelElement('li');
//     const anchorPos=anchor[anchor.length-1];
//     const focusPos=focus[focus.length-1];

//     //handle zero length selection
//     if(anchor==focus){
//       this.insertNewLi(firstText, anchorPos);
//     }
//     //handle long selection of single li item
//     else if(firstParentLi==lastParentLi){
//       //if one item is inside
//       if(selection.length==1){
//         const split=firstText?.split(anchorPos);
//         const rightSplit=split.right.split(focusPos-split.left.length);
//         const selectedText=rightSplit.left;
//         const textTobeMoved=rightSplit.right;

//         selectedText.parent.removeChild(selectedText);
//         const position=split.left.length-1;
//         split.left.content+=textTobeMoved.content;
//         textTobeMoved.parent.removeChild(textTobeMoved);
//         this.insertNewLi(split.left, position+1);
//       }
//       //if multiple items are inside
//       else{
//         const firstSplit=firstText?.split(anchorPos);
//         const lastSplit=lastText?.split(focusPos);
//         this.deleteSelection(firstSplit.left, lastSplit.left);
//         const position=firstSplit.left.length-1;
//         this.insertNewLi(firstSplit.left, position+1);
//       }
//     }
//     //handle multiple selected elems
//     else{

//       const firstSplit=firstText?.split(anchorPos);
//       const lastSplit=lastText?.split(focusPos);
//       this.deleteLeft(lastSplit.left);
//       this.deleteRight(firstSplit.right);

//       firstParentLi.parent.addChild(newLi, firstParentLi?.index+1);

//       //delete inbetween elements
//       //do not delete parent lis
//       for(let i=0; i<selected.length; i++){
//         if(selected[i].type){
//           if(selected[i].type=='li' &&
//              selected[i]!=firstParentLi &&
//              selected[i]!=lastParentLi){
//               selected[i].parent?.removeChild(selected[i]);
//           }
//         }
//       }
//     }


//     this.model.write();
//     this.model.readSelection();
//     return;
//   }

//   //this took we waaaaaay to long to figure out
    insertNewLi(text:ModelText, splitPosition: number):void{
      //split the text and get path to the left element to find the copy later
      const split=text.split(splitPosition);
      const leftTextPath=split.left.getIndexPath();
      const rightTextPath=split.right.getIndexPath();
      //find closest ancestor li and ul to first text element also get path to li
      const firstParentLi=split.left.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='li'), false);
      const firstLiPath=firstParentLi?.getIndexPath();
      const firstParentUl=firstParentLi.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='ul' || node.type=='ol'), false);
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
      //remove right nodes
      var sibling=rightSideFirstLi;
      this.deleteRight(sibling);
      //remove left siblings
      sibling=leftSideSecondLi;
      this.deleteLeft(sibling);
    }
//   deleteSelection(first: ModelNode, last: ModelNode){
//     //make sure the first node is deleted
//     let node=last;
//     let deleteNode=true;
//     while(node){
//       //stop if we reached the first node
//       if(node==first){
//           break;
//       }
//       if(deleteNode){
//         node.parent?.removeChild(node);
//       }
//       //remove all siblings to the left but keep direct parents
//       if(node.previousSibling){
//         node=node.previousSibling;
//         deleteNode=true;
//       }
//       else if(node.parent){
//         node=node.parent;
//         deleteNode=false;
//       }
//       else{
//         break;
//       }
//     }
//   }
//   deleteLeft(node: ModelNode): void{
//     //make sure the first node is deleted
//     let deleteNode=true;
//     while(node){
//       //stop if we reached the parent li
//       if(node.type){
//         if(node.type=='li'){
//           break;
//         }
//       }
//       if(deleteNode){
//         node.parent?.removeChild(node);
//       }
//       //remove all siblings to the left but keep direct parents
//       if(node.previousSibling){
//         node=node.previousSibling;
//         deleteNode=true;
//       }
//       else if(node.parent){
//         node=node.parent;
//         deleteNode=false;
//       }
//       else{
//         break;
//       }
//     }
//   }

//   deleteRight(node: ModelNode): void{
//     //make sure the first node is deleted
//     let deleteNode=true;
//     while(node){
//       //stop if we reached the parent li
//       if(node.type){
//         if(node.type=='li'){
//           break;
//         }
//       }
//       if(deleteNode){
//         node.parent?.removeChild(node);
//       }
//       //remove all siblings to the left but keep direct parents
//       if(node.nextSibling){
//         node=node.nextSibling;
//         deleteNode=true;
//       }
//       else if(node.parent){
//         node=node.parent;
//         deleteNode=false;
//       }
//       else{
//         break;
//       }
//     }
//   }

//   //i think this is usefull overall and should be moved somewhere
//   getNodeByIndexPath(path: number[]):ModelNode{
//     const root=this.model.rootModelNode;
//     var result=root;
//     for(let i=0; i<path.length; i++){
//       //incase a selection gets passed
//       if(i==path.length-1 && result.modelNodeType=="TEXT"){
//         return result;
//       }
//       result=result.children[path[i]];
//     }
//     return result;
//   }
// }
}
