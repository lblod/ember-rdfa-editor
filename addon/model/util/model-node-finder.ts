import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";


export interface NodeFinderConfig<T> {
  startNode: T;
  endNode: T;
  rootNode: T;
  nodeFilter?: (node: T) => boolean;
  predicate?: (node: T) => boolean;
  direction?: Direction;
}

function dummy() {
  return true;
}

export default class ModelNodeFinder implements Iterable<ModelNode> {
  startNode: ModelNode;
  private _current: ModelNode | null;
  endNode: ModelNode;
  rootNode: ModelNode;
  nodeFilter: (node: ModelNode) => boolean;
  predicate: (node: ModelNode) => boolean;
  direction: Direction;

  constructor(config: NodeFinderConfig<ModelNode>) {
    this.startNode = config.startNode;
    this._current = this.startNode;
    this.endNode = config.endNode;
    this.rootNode = config.rootNode;
    this.nodeFilter = config.nodeFilter ?? dummy;
    this.predicate = config.predicate ?? dummy;
    this.direction = config.direction ?? Direction.FORWARDS;
  }

  get current(): ModelNode | null {
    return this._current;
  }

  next(): ModelNode | null {
    let cur: ModelNode | null = this.current;
    let found = false;

    while (cur && !found) {
      found = this.predicate(cur);
      cur = this.findNextNode(cur);
    }
    this._current = cur;

    return found ? cur : null;
  }

  private findNextNode(node: ModelNode): ModelNode | null {
    let candidate = this.findNextNodeToConsider(node);
    while(candidate && !this.nodeFilter(candidate)) {
      candidate = this.findNextNodeToConsider(candidate);
    }
    return candidate;
  }

  private findNextNodeToConsider(node: ModelNode): ModelNode | null {
    const children = ModelNodeFinder.getChildren(node);
    let next;
    if (children) {
      next = this.firstOrLastChild(children);
    } else {
      const sibling = this.nextSibling(node);
      if(sibling) {
        next = sibling;
      } else {
        next = node.parent;
        if(next === this.rootNode.parent) {
          next = null;
        }
      }

    }
    if(next === this.endNode) {
      next = null;
    }
    return next;
  }

  private nextSibling(node: ModelNode): ModelNode | null {
    if (this.direction === Direction.FORWARDS) {
      return node.nextSibling;
    } else {
      return node.previousSibling;
    }
  }

  private static getChildren(node: ModelNode) : ModelNode[] | null {
    if (node instanceof ModelElement) {
      return node.childCount ? node.children : null;
    }
    return null;
  }

  private firstOrLastChild(children: ModelNode[]) {
    return this.direction === Direction.FORWARDS ? children[0] : children[children.length - 1];
  }

  [Symbol.iterator](): Iterator<ModelNode> {
    return {
      next(): IteratorResult<ModelNode> {
        const value = this.next();
        return {
          value,
          done: !!value
        };
      }
    };
  }

}
