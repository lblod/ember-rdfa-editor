import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";

export interface NodeFinderConfig<T> {
  startNode: T;
  endNode?: T;
  rootNode: T;
  nodeFilter?: (node: T) => boolean;
  predicate?: (node: T) => boolean;
  direction?: Direction;
}
function dummy() {
  return true;
}

export default abstract class NodeFinder<T extends Node | ModelNode> implements Iterable<T>{

  startNode: T;
  private _current: T | null;
  endNode?: T;
  rootNode: T;
  nodeFilter: (node: T) => boolean;
  predicate: (node: T) => boolean;
  direction: Direction;

  constructor(config: NodeFinderConfig<T>) {
    this.startNode = config.startNode;
    this._current = this.startNode;
    this.endNode = config.endNode;
    this.rootNode = config.rootNode;
    this.nodeFilter = config.nodeFilter ?? dummy;
    this.predicate = config.predicate ?? dummy;
    this.direction = config.direction ?? Direction.FORWARDS;
  }

  get current(): T | null {
    return this._current;
  }

  next(): T | null {
    let cur: T | null = this.current;
    let found = false;
    if(cur) {
      found = this.predicate(cur);
    }

    while (cur && !found) {
      cur = this.findNextNode(cur);
      if(cur) {
        found = this.predicate(cur);
      }
    }
    this._current = cur;

    return found ? cur : null;
  }

  private findNextNode(node: T): T | null {
    let candidate = this.findNextNodeToConsider(node);
    while (candidate && !this.nodeFilter(candidate)) {
      candidate = this.findNextNodeToConsider(candidate);
    }
    return candidate;
  }

  private findNextNodeToConsider(node: T): T | null {
    const children = this.getChildren(node);
    let next;
    if (children) {
      next = this.firstOrLastChild(children);
    } else {
      const sibling = this.nextSibling(node);
      if (sibling) {
        next = sibling;
      } else {
        next = this.getParent(node);
        if (next === this.getParent(this.rootNode)) {
          next = null;
        }
      }

    }
    if (next === this.endNode) {
      next = null;
    }
    return next;
  }

  protected abstract nextSibling(node: T): T | null;
  protected abstract getChildren(node: T): T[] | null;
  protected abstract getParent(node: T): T | null;

  private firstOrLastChild(children: T[]) {
    return this.direction === Direction.FORWARDS ? children[0] : children[children.length - 1];
  }

  [Symbol.iterator](): Iterator<T> {
    return {
      next(): IteratorResult<T> {
        const value = this.next();
        return {
          value,
          done: !!value
        };
      }
    };
  }

}
