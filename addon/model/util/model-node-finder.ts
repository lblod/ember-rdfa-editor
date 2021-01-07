import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import NodeFinder from "@lblod/ember-rdfa-editor/model/util/node-finder";


export default class ModelNodeFinder extends NodeFinder<ModelNode> {

  protected nextSibling(node: ModelNode): ModelNode | null {
    if (this.direction === Direction.FORWARDS) {
      return node.nextSibling;
    } else {
      return node.previousSibling;
    }
  }

  protected getChildren(node: ModelNode): ModelNode[] | null {
    if (node instanceof ModelElement) {
      return node.childCount ? node.children : null;
    }
    return null;
  }

  protected getParent(node: ModelNode): ModelNode | null {
    return node.parent;
  }
}
