import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";
import {NodeFinderConfig} from "@lblod/ember-rdfa-editor/model/util/model-node-finder";

function dummy() {
  return true;
}

export default class DomNodeFinder implements Iterable<Node> {
  startNode: Node;
  private _current: Node | null;
  endNode: Node;
  rootNode: Node;
  nodeFilter: (node: Node) => boolean;
  predicate: (node: Node) => boolean;
  direction: Direction;

  constructor(config: NodeFinderConfig<Node>) {
    this.startNode = config.startNode;
    this._current = this.startNode;
    this.endNode = config.endNode;
    this.rootNode = config.rootNode;
    this.nodeFilter = config.nodeFilter ?? dummy;
    this.predicate = config.predicate ?? dummy;
    this.direction = config.direction ?? Direction.FORWARDS;
  }

  get current(): Node | null {
    return this._current;
  }

  next(): Node | null {
    let cur: Node | null = this.current;
    let found = false;

    while (cur && !found) {
      found = this.predicate(cur);
      cur = this.findNextNode(cur);
    }
    this._current = cur;

    return found ? cur : null;
  }

  private findNextNode(node: Node): Node | null {
    let candidate = this.findNextNodeToConsider(node);
    while (candidate && !this.nodeFilter(candidate)) {
      candidate = this.findNextNodeToConsider(candidate);
    }
    return candidate;
  }

  private findNextNodeToConsider(node: Node): Node | null {
    const children = DomNodeFinder.getChildren(node);
    let next;
    if (children) {
      next = this.firstOrLastChild(children);
    } else {
      const sibling = this.nextSibling(node);
      if (sibling) {
        next = sibling;
      } else {
        next = node.parentNode;
        if (next === this.rootNode.parentNode) {
          next = null;
        }
      }

    }
    if (next === this.endNode) {
      next = null;
    }
    return next;
  }

  private nextSibling(node: Node): Node | null {
    if (this.direction === Direction.FORWARDS) {
      return node.nextSibling;
    } else {
      return node.previousSibling;
    }
  }

  private static getChildren(node: Node): NodeList | null {
    return node.hasChildNodes() ? node.childNodes : null;
  }

  private firstOrLastChild(children: NodeList) {
    return this.direction === Direction.FORWARDS ? children[0] : children[children.length - 1];
  }

  [Symbol.iterator](): Iterator<Node> {
    return {
      next(): IteratorResult<Node> {
        const value = this.next();
        return {
          value,
          done: !!value
        };
      }
    };
  }

}
