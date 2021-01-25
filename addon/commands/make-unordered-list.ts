import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelElement, {ElementType} from "../model/model-element";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";


/**
 * command will convert all nodes in the selection to a list if they are not already in a list
 */
export default class MakeUnorderedListCommand extends Command {
  name = "make-unordered-list";

  constructor(model: Model) {
    super(model);
  }

  getTopBlockNode(node: ModelNode): ModelNode | null {
    if(node.isBlock) return node;
    if(ModelElement.isModelElement(node)) {
      const element = node as ModelElement;
      for(const child of element.children) {
        if(child.boundNode?.nodeName === 'BR') {
          return node;
        }
      }
      if(!node.parent) return null;
      return this.getTopBlockNode(node.parent);
    } else {
      if(!node.parent) return null;
      return this.getTopBlockNode(node.parent);
    }
  }

  execute(selection: ModelSelection = this.model.selection) {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const commonAncestor = selection.getCommonAncestor();
    let parentElement = commonAncestor?.parentElement;
    let offset = selection.lastRange.start.parentOffset;
    if(!commonAncestor) return;


    let nodes: ModelNode[] = [];
    if(selection.isCollapsed) {
      const topElement = this.getTopBlockNode(commonAncestor.parent);
      if(topElement) {
        parentElement = topElement?.parent;
        offset = topElement?.parent?.children.indexOf(topElement);

        nodes = [topElement];
      }
    } else {

      // collect all selected nodes
      const nodeFinder = new ModelNodeFinder({
        startNode: selection.lastRange.start.parent,
        endNode: selection.lastRange.end.parent,
        rootNode: commonAncestor.parent,
        direction: Direction.FORWARDS
      });
      const allNodesInSelection = Array.from(nodeFinder);
      for(const node of allNodesInSelection) {
          const topBlock = this.getTopBlockNode(node);
          if(topBlock && nodes[nodes.length-1] !== topBlock) {
            nodes.push(topBlock);
          }
      }
      offset = parentElement.children.indexOf(nodes[0]);
    }
    const items = [];
    let index = 0;
    const lastNode = nodes[nodes.length - 1];

    // if there's a br to the right of the last collected node, remove it
    // not sure this is the way to go
    // can probably be replaced by if(tagName(lastNode.nextSibling?.boundNode) === "br")
    if(lastNode.nextSibling && ModelNode.isModelElement(lastNode.nextSibling) && lastNode.nextSibling.boundNode?.nodeName === 'BR') {
      this.model.removeModelNode(lastNode.nextSibling);
    }

    for(const node of nodes) {
      // if we find a br in our collected nodes, remove it from the model
      // and increase the rowIndex in the items matrix
      // else, add node to current row of items
      // the isModelElement check is probably redundant
      if(ModelNode.isModelElement(node) && tagName(node.boundNode) === 'br') {
        index++;
        this.model.removeModelNode(node);
        continue;
      } else {
        if(items[index]) {
          items[index].push(node);
        } else {
          items[index] = [node];
        }
      }
      this.model.removeModelNode(node);
    }
    const listNode = this.buildList('ul', items);

    if(parentElement) {
      parentElement.addChild(listNode, offset);
      this.model.write(parentElement);
    }

  }

  /**
   * Construct a model list tree from a matrix of content
   * every row will become a <li> with the row items as its children
   * @param type
   * @param items
   */
  private buildList(type: ElementType, items: ModelNode[][]) {
    const rootNode = new ModelElement(type);
    for(const item of items) {
      const listItem = new ModelElement('li');
      listItem.appendChildren(...item);
      rootNode.addChild(listItem);
    }
    return rootNode;
  }
}
