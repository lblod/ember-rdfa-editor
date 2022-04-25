import { FilterResult } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import {
  AssertionError,
  NotImplementedError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { NOOP } from '@lblod/ember-rdfa-editor/model/util/constants';

export interface Walkable {
  parentNode: Walkable | null;
  firstChild: Walkable | null;
  lastChild: Walkable | null;
  nextSibling: Walkable | null;
  previousSibling: Walkable | null;
}

export type GenTreeWalkerConfig<T extends Walkable> =
  StartEndTreeWalkerConfig<T>;
export type NodeHandler<T extends Walkable> = (node: T) => void;

export interface BaseTreeWalkerConfig<T extends Walkable> {
  reverse?: boolean;
  filter?: WalkFilter<T>;
  descend?: boolean;
  onEnterNode?: NodeHandler<T>;
  onLeaveNode?: NodeHandler<T>;
  visitParentUpwards?: boolean;
}

export interface RootTreeWalkerConfig<T extends Walkable>
  extends BaseTreeWalkerConfig<T> {
  root: T;
}

export interface StartEndTreeWalkerConfig<T extends Walkable>
  extends BaseTreeWalkerConfig<T> {
  start?: T;
  end?: T;
  root: T;
}

export interface ModelRangeTreeWalkerConfig
  extends BaseTreeWalkerConfig<ModelNode> {
  range: ModelRange;
}

export interface TreeWalkerFactory {
  fromSubTree<U extends Walkable>(
    config: RootTreeWalkerConfig<U>
  ): GenTreeWalker<U>;

  fromStartEnd<U extends Walkable>(
    config: StartEndTreeWalkerConfig<U>
  ): GenTreeWalker<U>;

  fromRange(config: ModelRangeTreeWalkerConfig): GenTreeWalker<ModelNode>;
}

export type WalkFilter<T extends Walkable> = (node: T) => FilterResult;

export default class GenTreeWalker<T extends Walkable = Walkable> {
  private readonly _root: T;
  private readonly _filter: WalkFilter<T>;
  private _currentNode: Walkable | null;
  private descend: boolean;
  private visitParentUpwards: boolean;
  private _start: T;
  private _end?: T;
  private _reverse: boolean;
  private _isAtEnd: boolean;
  private _onEnterNode: NodeHandler<T>;
  private _onLeaveNode: NodeHandler<T>;
  private _didDescend: Set<Walkable>;

  constructor({
    root,
    start = root,
    end,
    descend = true,
    visitParentUpwards = false,
    filter = () => FilterResult.FILTER_ACCEPT,
    reverse = false,
    onEnterNode = NOOP,
    onLeaveNode = NOOP,
  }: GenTreeWalkerConfig<T>) {
    this._root = root;
    this._start = start;
    this._end = end;
    this.descend = descend;
    if (!descend) {
      throw new NotImplementedError('WIP, not implemented yet');
    }
    if (end && !descend) {
      throw new NotImplementedError(
        'It is currently not supported to disable descending while also providing an explicit endNode.'
      );
    }
    this.visitParentUpwards = visitParentUpwards;
    this._filter = filter;
    this._reverse = reverse;
    this._currentNode = null;
    this._isAtEnd = false;
    this._onEnterNode = onEnterNode;
    this._onLeaveNode = onLeaveNode;
    this._didDescend = new Set<T>();
  }

  static fromSubTree<U extends Walkable>(
    config: RootTreeWalkerConfig<U>
  ): GenTreeWalker<U> {
    return new GenTreeWalker<U>({
      ...config,
      start: undefined,
      end: undefined,
    });
  }

  static fromStartEnd<U extends Walkable>(config: StartEndTreeWalkerConfig<U>) {
    return new GenTreeWalker<U>(config);
  }

  static fromRange(
    config: ModelRangeTreeWalkerConfig
  ): GenTreeWalker<ModelNode> {
    const {
      range,
      descend,
      visitParentUpwards,
      reverse = false,
      filter,
      onLeaveNode,
      onEnterNode,
    } = config;
    let startNode;
    let endNode;
    let startPos: ModelPosition;
    let endPos: ModelPosition;
    let invalid = false;
    let shouldDescendEnd = true;
    if (reverse) {
      startPos = range.end;
      endPos = range.start;
    } else {
      startPos = range.start;
      endPos = range.end;
    }

    if (range.collapsed) {
      if (startPos.isInsideText()) {
        const textNode = getNextNodeFromPosition(startPos, reverse)!;
        startNode = textNode;
        endNode = textNode;
      } else {
        // collapsed range not in a textnode, means no nodes can be valid
        invalid = true;
      }
    } else {
      startNode = getNextNodeFromPosition(startPos, reverse);
      endNode = getPrevNodeFromPosition(endPos, reverse);
      if (startNode && endNode && startNode === endNode) {
        return GenTreeWalker.fromSubTree({
          root: startNode,
          descend,
          reverse,
          filter,
          visitParentUpwards,
          onEnterNode,
          onLeaveNode,
        });
      }
      if (!startNode) {
        const ancestorWithSibling = startPos.parent
          .findSelfOrAncestors((node) => !!getNextSibling(node, reverse))
          .next().value;
        if (ancestorWithSibling) {
          startNode = getNextSibling(ancestorWithSibling, reverse)!;
        } else {
          // the start position is at the end of the document
          // no valid nodes can be found
          invalid = true;
        }
      }
      if (!invalid && !endNode) {
        endNode = endPos.parent;
        shouldDescendEnd = false;
      }
    }
    const root = range.root;
    if (invalid) {
      return GenTreeWalker.fromInvalid({
        root,
        descend,
        visitParentUpwards,
        reverse,
        filter,
        onLeaveNode,
        onEnterNode,
      });
    } else {
      if (!startNode || !endNode) {
        throw new AssertionError(
          'Start and end nodes should be assigned by now'
        );
      }
      if (shouldDescendEnd) {
        const nextDeepestDescendant = getNextDeepestDescendant(
          endNode,
          reverse
        );
        if (nextDeepestDescendant) {
          endNode = nextDeepestDescendant;
        }
      }
      return new GenTreeWalker<ModelNode>({
        root,
        start: startNode as ModelNode,
        end: endNode as ModelNode,
        descend,
        visitParentUpwards,
        reverse,
        filter,
        onLeaveNode,
        onEnterNode,
      });
    }
  }

  /**
   * Helper to create a walker which has no nodes to walk over, aka an empty generator.
   * @param config
   * @private
   */
  private static fromInvalid<U extends Walkable>(
    config: GenTreeWalkerConfig<U>
  ) {
    const result = GenTreeWalker.fromStartEnd(config);
    result._isAtEnd = true;
    return result;
  }

  get root(): T {
    return this._root;
  }

  get currentNode(): T | null {
    return this._currentNode as T | null;
  }

  *nodes(): Generator<T> {
    let result = this.nextNode();
    while (result) {
      yield result;
      result = this.nextNode();
    }
  }

  /**
   * Walk over all nodes. Use this if you only care about the
   * side-effects of the onEnter and onLeave callbacks
   */
  walk(): void {
    let result = this.nextNode();
    while (result) {
      result = this.nextNode();
    }
  }

  /**
   * Reset the walker state so the generator can be reused.
   */
  reset() {
    this._currentNode = null;
    this._isAtEnd = false;
  }

  nextNode(): T | null {
    let next: T | null;
    if (this._isAtEnd) {
      next = null;
    } else if (!this._currentNode) {
      // If there is no currentNode but we're also not at the end,
      // we must be before the start.
      // first try if the startNode is a valid node
      this._onEnterNode(this._start);
      if (this.filterNode(this._start) === FilterResult.FILTER_ACCEPT) {
        // if it is, use it
        next = this._start;
      } else {
        // if it's not, walk from it and use the result
        next = this.walkNode(this._start, this._reverse);
      }
    } else {
      // There is a currentNode, so we can simply walk from it
      next = this.walkNode(this._currentNode, this._reverse);
    }

    // whatever we found is now the currentNode
    this._currentNode = next;
    if (!next) {
      // if we found a null by walking, we must be at the end
      this._isAtEnd = true;
    }
    return next;
  }

  private walkNode(fromNode: Walkable, reverse: boolean): T | null {
    // start at the currentNode, which is the node we ended on the last time
    // this method was run
    if (this._end && fromNode === this._end) {
      return null;
    }
    let node = fromNode;
    let result = FilterResult.FILTER_ACCEPT;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this._end && fromNode === this._end) {
        result = this.filterNode(node);
        this._isAtEnd = true;
        if (result === FilterResult.FILTER_ACCEPT) {
          return node as T | null;
        } else {
          return null;
        }
      }
      // as long as we dont get a reject, go depth first into the child tree
      // if descend is false, don't do this (used to iterate over the toplevel nodes of a range)
      let child = getFirstChild(node, reverse);
      while (this.descend && child && !this._didDescend.has(node)) {
        this._didDescend.add(node);
        node = child;
        if (this._end && node === this._end) {
          this._isAtEnd = true;
          result = this.filterNode(node);
          if (result === FilterResult.FILTER_ACCEPT) {
            return node as T | null;
          } else {
            return null;
          }
        }
        this._onEnterNode(node as T);
        result = this.filterNode(node);
        if (result === FilterResult.FILTER_ACCEPT) {
          // we've found an acceptable node, save it and return it
          return node as T | null;
        }
        child = getFirstChild(node, reverse);
      }
      this._onLeaveNode(node as T);

      // at this point we've gone as deep as we can but haven't found a node yet
      // so we start going sideways or back up
      let sibling = null;
      let temporary: Walkable | null = node;
      while (temporary) {
        if (temporary === this.root) {
          return null;
        }
        // try going sideways first
        sibling = getNextSibling(temporary, reverse);
        if (sibling) {
          // there was a sibling, break here
          node = sibling;
          this._onEnterNode(node as T);
          break;
        }
        // walk back up and try to find a sibling there
        // we don't care about these nodes since we've already visited them
        // unless visitParentUpwards is true
        temporary = temporary.parentNode;
        this._onLeaveNode(temporary as T);
        if (this.visitParentUpwards && temporary) {
          result = this.filterNode(temporary);
          this._didDescend.add(temporary);
          if (result === FilterResult.FILTER_ACCEPT) {
            return temporary as T | null;
          }
        }
      }
      // test the node we found (this was a sibling or a sibling of the parent)
      if (this._end && node === this._end) {
        this._isAtEnd = true;
        result = this.filterNode(node);
        if (result === FilterResult.FILTER_ACCEPT) {
          return node as T | null;
        } else {
          return null;
        }
      }
      result = this.filterNode(node);
      if (result === FilterResult.FILTER_ACCEPT) {
        return node as T | null;
      }

      // the node did not qualify, we will visit its children on the next loop
    }
  }

  private filterNode(node: Walkable): FilterResult {
    if (!this._filter) {
      return FilterResult.FILTER_ACCEPT;
    }

    return this._filter(node as T);
  }
}

function getFirstChild(node: Walkable, reverse: boolean): Walkable | null {
  return reverse ? node.lastChild : node.firstChild;
}

function getLastChild(node: Walkable, reverse: boolean): Walkable | null {
  return reverse ? node.firstChild : node.lastChild;
}

function getNextSibling(node: Walkable, reverse: boolean): Walkable | null {
  return reverse ? node.previousSibling : node.nextSibling;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPreviousSibling(node: Walkable, reverse: boolean): Walkable | null {
  return reverse ? node.nextSibling : node.previousSibling;
}

function getNextNodeFromPosition(position: ModelPosition, reverse: boolean) {
  return reverse ? position.nodeBefore() : position.nodeAfter();
}

function getPrevNodeFromPosition(position: ModelPosition, reverse: boolean) {
  return reverse ? position.nodeAfter() : position.nodeBefore();
}

function getNextDeepestDescendant(
  node: Walkable,
  reverse: boolean
): Walkable | null {
  let cur = node;
  let child = getLastChild(cur, reverse);
  while (child) {
    cur = child;
    child = getLastChild(cur, reverse);
  }
  return cur;
}
