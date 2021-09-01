import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";

export type NodeFinderFilter<T, R extends T> = (node: T) => node is R;
export type NodeFinderPredicate<T, R extends T> = (node: R) => boolean;

export interface NodeFinderConfig<T, R extends T> {
  startNode: T;
  endNode?: T;
  rootNode: T;
  nodeFilter?: NodeFinderFilter<T, R>
  predicate?: NodeFinderPredicate<T, R>
  direction?: Direction;
  useSiblingLinks?: boolean;
}

function dummy() {
  return true;
}

/**
 * Utility class to search for nodes which satisfy a predicate and a filter.
 * The predicate can assume it will only receive nodes that also satisfy the filter function.
 * The algorithm is DFS but modified so it can also walk upwards.
 * Can be implemented for different types of nodes.
 * @deprecated use {@link ModelTreeWalker} instead
 */
export default abstract class NodeFinder<T extends Node | ModelNode, R extends T> implements Iterable<R> {
  startNode: T;
  private _current: T | null;
  endNode?: T;
  rootNode: T;
  nodeFilter: (node: T) => boolean;
  predicate: (node: T) => boolean;
  direction: Direction;
  stack: T[];
  visited: Map<T, boolean>;
  visitSiblings = false;

  constructor(config: NodeFinderConfig<T, R>) {
    this.startNode = config.startNode;
    this._current = this.startNode;
    this.endNode = config.endNode;
    this.rootNode = config.rootNode;
    this.nodeFilter = config.nodeFilter ?? dummy;
    this.predicate = config.predicate ?? dummy;
    this.direction = config.direction ?? Direction.FORWARDS;
    this.stack = [this.startNode];
    this.visited = new Map<T, boolean>();
    this.visitSiblings = config.useSiblingLinks ?? true;
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
  next(): R | null {
    // debugger;
    let cur: T | null = this.findNextNode();
    let found = false;
    if (cur) {
      found = this.nodeFilter(cur) && this.predicate(cur);
    }
    while (cur && !found && cur !== this.endNode) {
      cur = this.findNextNode();
      if (cur) {
        found = this.nodeFilter(cur) && this.predicate(cur);
      }
    }
    if(cur === this.endNode) {

      // we've visited the endNode, so we clear out any pending nodes
      this.stack = [];
      this._current = cur;
    }

    return found ? cur as R : null;
  }

  /**
   * Get the next node in the direction that satisfies the filter
   * @private
   */
  private findNextNode(): R | null {
    let candidate = this.findNextNodeToConsider();
    while (candidate && !this.nodeFilter(candidate) && candidate !== this.endNode) {
      candidate = this.findNextNodeToConsider();
    }
    return candidate as R;
  }

  /**
   * Main algorithm driver.
   * @private
   */
  private findNextNodeToConsider(): T | null {
    let node = this.stack.pop();
    // skip nodes that are already visited
    while (node && this.visited.get(node)) {
      node = this.stack.pop();
    }
    if (!node) {
      return null;
    }
    this.visited.set(node, true);
    let prev = this.nextSibling(node, this.inverseDirection(this.direction));
    // We dont want to visit siblings in the other direction
    // this is an alternative to being more careful when adding children to the stack
    // potential optimization target
    while (prev) {
      this.visited.set(prev, true);
      prev = this.nextSibling(prev, this.inverseDirection(this.direction));
    }

    // this is a stack, so we add things we want to visit in reverse order
    const parent = this.getParent(node)!;
    if (parent !== this.getParent(this.rootNode)) {
      this.stack.push(parent);
    }
    // TODO: I think this should not be configurable but instead should never
    // use the sibling links, it leads to too much confusion
    if(this.visitSiblings) {
      const sibling = this.nextSibling(node, this.direction);
      if (sibling && node !== this.rootNode) {
        this.stack.push(sibling);
      }
    }


    const children = this.getChildren(node);
    if (children) {
      this.pushChildren(children);
    }

    return node;
  }

  /**
   * Utility to flip a direction
   * @param direction
   * @private
   */
  private inverseDirection(direction: Direction) {
    return direction === Direction.FORWARDS ? Direction.BACKWARDS : Direction.FORWARDS;
  }

  /**
   * Get the next sibling according to the direction
   * @param node
   * @param direction
   * @protected
   */
  protected abstract nextSibling(node: T, direction: Direction): T | null;

  /**
   * Get the children of node if it has them, otherwise return null
   * @param node
   * @protected
   */
  protected abstract getChildren(node: T): T[] | null;

  /**
   * Get the parent of node if it has one, otherwise return null
   * @param node
   * @protected
   */
  protected abstract getParent(node: T): T | null;

  /**
   * Utility to push children onto the stack according to the direction
   * @param children
   * @private
   */
  private pushChildren(children: T[]) {
    if (this.direction === Direction.FORWARDS) {
      const childrenCopy = [...children];
      childrenCopy.reverse();
      this.stack.push(...childrenCopy);
    } else {
      this.stack.push(...children);
    }
  }


  [Symbol.iterator](): Iterator<R> {
    return {
      next: (): IteratorResult<R, null> => {
        const value = this.next();
        if (value) {
          return {
            value,
            done: false
          };
        } else {
          return {
            value: null,
            done: true,
          };
        }
      }
    };
  }

}
