import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import { Direction } from "@lblod/ember-rdfa-editor/model/util/types";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelElement from "../model/model-element";

/**
 * command will convert all nodes in the selection to a list if they are not already in a list
 */
export default class MakeUnorderedListCommand extends Command {
  name = "make-unordered-list";
  constructor(model: Model) {
    super(model);
  }

  execute(selection?: ModelSelection) {
    if (!selection) {
      selection = this.model.selection;
    }

    const nodeFinder = new ModelNodeFinder({
      startNode: selection.anchor!,
      endNode: selection.focus!,
      rootNode: selection.commonAncestor!,
      direction: Direction.FORWARDS
    });
    const nodes = Array.from(nodeFinder) as ModelNode[];
    console.log(nodes);
    const items = [];
    let index = 0;
    for(const node of nodes) {
      if(ModelNode.isModelElement(node) && node.boundNode?.nodeName === 'BR') {
        index++;
        continue;
      } else {
        if(items[index]) {
          items[index].push(node);
        } else {
          items[index] = [node];
        }
      }
      console.log(node.parent);
      this.model.removeModelNode(node);
    }
    const listNode = this.buildList('ul', items);

    if(ModelElement.isModelElement(selection.commonAncestor)) {
      const commonAncestor = selection.commonAncestor as ModelElement;
      commonAncestor.addChild(listNode, selection.anchorOffset);
      this.model.write(commonAncestor);
    }
    
  }
  buildList(type: String, items: ModelNode[][]) {
    const rootNode = new ModelElement(type);
    for(const item of items) {
      const listItem = new ModelElement('li');
      for(const child of item) {
        listItem.addChild(child);
      }
      rootNode.addChild(listItem);
    }
    return rootNode;
  }
}
