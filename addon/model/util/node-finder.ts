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

/**
 * Utility class to search for nodes which satisfy a predicate and a filter.
 * The predicate can assume it will only receive nodes that also satisfy the filter function.
 * The algorithm is DFS but modified so it can also walk upwards.
 * Can be implemented for different types of nodes.
 */
export default abstract class NodeFinder<T extends Node | ModelNode> implements Iterable<T>{

  startNode: T;
  private _current: T | null;
  endNode?: T;
  rootNode: T;
  nodeFilter: (node: T) => boolean;
  predicate: (node: T) => boolean;
  direction: Direction;
  stack: T[];
  visited: Map<T, boolean>;


  constructor(config: NodeFinderConfig<T>) {
    this.startNode = config.startNode;
    this._current = this.startNode;
    this.endNode = config.endNode;
    this.rootNode = config.rootNode;
    this.nodeFilter = config.nodeFilter ?? dummy;
    this.predicate = config.predicate ?? dummy;
    this.direction = config.direction ?? Direction.FORWARDS;
    this.stack = [this.startNode];
    this.visited = new Map<T, boolean>();
  }

  /**
   * Either the start node, the last found node, or null when the search has completed
   */
  get current(): T | null {
    return this._current;
  }

  /**
   * Find the next node satisfying the conditions. This looks at the children first, then siblings
   * (and their children) and then goes up one level and does it again.
   */
  next(): T | null {
    let cur: T | null = this.findNextNode();
    let found = false;
    if(cur) {
      found = this.nodeFilter(cur) && this.predicate(cur);
    }

    while (cur && !found) {
      cur = this.findNextNode();
      if(cur) {
        found = this.nodeFilter(cur) && this.predicate(cur);
      }
    }
    this._current = cur;

    return found ? cur : null;
  }

  /**
   * Get the next node in the direction that satisfies the filter
   * @private
   */
  private findNextNode(): T | null {
    let candidate = this.findNextNodeToConsider();
    while (candidate && !this.nodeFilter(candidate)) {
      candidate = this.findNextNodeToConsider();
    }
    return candidate;
  }

  /**
   * Main algorithm driver.
   * @private
   */
  private findNextNodeToConsider(): T | null {
    let node = this.stack.pop();
    while(node && this.visited.get(node) && node !== this.endNode) {
      node = this.stack.pop();
    }
    if(!node) {
      return null;
    }
    this.visited.set(node, true);

    const parent = this.getParent(node)!;
    this.stack.push(parent);

    const sibling = this.nextSibling(node);
    if (sibling) {
      this.stack.push(sibling);
    }

    const children = this.getChildren(node);
    if (children) {
      this.pushChildren(children);
    }

    return node;
  }

  protected abstract nextSibling(node: T): T | null;
  protected abstract getChildren(node: T): T[] | null;
  protected abstract getParent(node: T): T | null;

  /**
   * Utility to push children onto the stack according to the direction
   * @param children
   * @private
   */
  private pushChildren(children: T[]) {
    if(this.direction === Direction.FORWARDS) {
      this.stack.push(...children);
    } else {
      const childrenCopy = [...children];
      childrenCopy.reverse();
      this.stack.push(...childrenCopy);
    }
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
