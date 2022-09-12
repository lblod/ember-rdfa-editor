import { Direction } from '@lblod/ember-rdfa-editor/utils/types';
import NodeFinder from '@lblod/ember-rdfa-editor/utils/node-finder';

/**
 * {@link Node domNode} implementation of a {@link NodeFinder}
 * @deprecated
 */
export default class DomNodeFinder<R extends Node> extends NodeFinder<Node, R> {
  protected nextSibling(node: Node, direction: Direction): Node | null {
    if (direction === Direction.FORWARDS) {
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
