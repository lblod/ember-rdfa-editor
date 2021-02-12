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

  canExecute(selection: ModelSelection = this.model.selection): boolean {
    const interestingLis = selection.findAllInSelection(
      {
        predicate: node => {
          const firstAncestorLi = node.findAncestor(node => ModelNode.isModelElement(node) && node.type === "li", false);
          const secondAncestorLi = firstAncestorLi?.findAncestor(node => ModelNode.isModelElement(node) && node.type === "li", false);
          return firstAncestorLi !== null && secondAncestorLi !== null;
        }
      }
    );
    const result = interestingLis && [...interestingLis];

    return !!result?.length;
  }

  execute(selection: ModelSelection = this.model.selection): void {
    if(!ModelSelection.isWellBehaved(selection)) {

      throw new MisbehavedSelectionError();
    }
    //get all nodes in selection that are li
    const listNodesIterator = selection.findAllInSelection({
      filter: ModelNode.isModelElement,
      predicate: (node: ModelElement) => node.type === "li"
    });


    //if there are no li in selection return error
    if (!listNodesIterator) {
      throw new SelectionError('The selection is not in a list');
    }
    const elements=[];
    for (const li of listNodesIterator){
      elements.push(li);
    }

    //get the shallowest common ancestors
    const lisToShift=this.relatedChunks(elements);

    if(lisToShift){

      //iterate over all found li elements
      for (const li of lisToShift){

        const node=li;
        const parent=li.parent;
        const grandParent=parent?.parent;
        const greatGrandParent=grandParent?.parent;

        if(node && parent && grandParent && greatGrandParent){
          //remove node
          const nodeIndex=node.index!;
          parent.removeChild(node);

          //remove parent ul/ol if node is only child
          if(parent.length==0){
            greatGrandParent.addChild(node, grandParent.index!+1);
            grandParent.removeChild(parent);
          }
          else{
            const split=parent.split(nodeIndex);
            //remove empty uls
            split.left.length==0?split.left.parent?.removeChild(split.left):null;
            split.right.length==0?split.right.parent?.removeChild(split.right):null;

            if(split.right.length>0){
              split.right.parent?.removeChild(split.right);
              node.addChild(split.right);
            }

            greatGrandParent.addChild(node, grandParent.index!+1);

          }
        }
      }
    }
    this.model.write();
    this.model.readSelection();
  }

  relatedChunks(elementArray:Array<ModelElement>, result:Array<ModelElement>=[]): Array<ModelElement>{

    //check that the li is nested
    elementArray=elementArray.filter(e=>
      e.parent?.parent?.type=='li'
    );

    //sort array, by depth, shallowest first.
    elementArray=elementArray.sort((a, b) => {
      return b.getIndexPath().length - a.getIndexPath().length;
    });

    //use shallowest as base
    const base=elementArray[0];
    result.push(base);

    //compare all paths to see if base is parent
    //remove those that are related
    for(let i =0; i<elementArray.length; i++){
      let e=elementArray[i];
      if(this.areRelated(base, e)){
        elementArray.splice(i, 1);
      }
    }

    //if empty return result with the elements that need to be shifted
    if(elementArray.length==0){
      return result;
    }
    //otherwise some hot recursive action
    else{
      this.relatedChunks(elementArray, result);
    }
    return result;
  }

  areRelated(base:ModelElement, compare:ModelElement): Boolean{
    const basePath=base.getIndexPath();
    const comparePath=compare.getIndexPath();
    for(var i=0; i<basePath.length; i++){
      if(basePath[i]!=comparePath[i]){
        return false;
      }
    }
    return true;
  }
}
