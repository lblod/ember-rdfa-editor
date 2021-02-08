import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {listTypes} from "@lblod/ember-rdfa-editor/model/util/constants";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
export default class UnindentListCommand extends Command {
  name: string = "unindent-list";
  constructor(model: Model) {
    super(model);
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

    //iterate over all found li elements
    for (const li of listNodesIterator){
      //check that the li is nested
      if(li.findAncestor(node => ModelNode.isModelElement(node) && node.type=='li')){
        //before:
        //ul    great-grandparent
        // li   grandparent
        //  ul  parent
        //   li node

        //after:
        //ul    great-grandparent
        // li   grandparent
        // li   node

        const node=li;
        const parent=li.findAncestor(node => ModelNode.isModelElement(node) && listTypes.has(node.type), false) as ModelElement;
        const grandParent=parent?.findAncestor(node => ModelNode.isModelElement(node) && listTypes.has(node.type), false) as ModelElement;
        const greatGrandParent=grandParent?.findAncestor(node => ModelNode.isModelElement(node) && listTypes.has(node.type), false) as ModelElement;

        if(node && parent && grandParent && greatGrandParent){
          //remove node
          const nodeIndex=node.index!;
          parent.removeChild(node);

          //remove parent if node is only child
          if(parent.length==0){
            if(parent.index){
              grandParent.addChild(node, parent.index);
              break;
            }
            grandParent.removeChild(parent);
          }

          //split parent at node index
          const parentSplitIndex=parent.split(nodeIndex).left.index;
          //insert node at parent.left index
          if(parentSplitIndex){
            grandParent.addChild(node, parentSplitIndex+1)
          }
        }
      }
    }

    this.model.write();
    this.model.readSelection();
  }
}
