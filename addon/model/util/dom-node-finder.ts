import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";
import NodeFinder from "@lblod/ember-rdfa-editor/model/util/node-finder";


/**
 * {@link Node domNode} implementation of a {@link NodeFinder}
 */
export default class DomNodeFinder extends NodeFinder<Node>{

  protected nextSibling(node: Node): Node | null {
    if (this.direction === Direction.FORWARDS) {
      return node.nextSibling;
    } else {
      return node.previousSibling;
    }
  }

  protected getChildren(node: Node): Node[] | null {
    return node.hasChildNodes() ? Array.from(node.childNodes) : null;
  }

  protected getParent(node: Node): Node | null {
    return node.parentNode;
  }


}
