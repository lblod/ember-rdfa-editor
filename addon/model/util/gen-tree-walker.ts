import {FilterResult} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";

export interface Walkable {
  parentNode: Walkable | null;
  firstChild: Walkable | null;
  lastChild: Walkable | null;
  nextSibling: Walkable | null;
  previousSibling: Walkable | null;
}

export type GenTreeWalkerConfig<T extends Walkable> = StartEndTreeWalkerConfig<T>;

export interface BaseTreeWalkerConfig<T extends Walkable> {
  reverse?: boolean;
  filter?: WalkFilter<T>;
  descend?: boolean;
  visitParentUpwards?: boolean;
}

export interface RootTreeWalkerConfig<T extends Walkable> extends BaseTreeWalkerConfig<T> {
  root: T;
}

export interface StartEndTreeWalkerConfig<T extends Walkable> extends BaseTreeWalkerConfig<T> {
  start?: T;
  end?: T;
  root: T;
}

export interface ModelRangeTreeWalkerConfig extends BaseTreeWalkerConfig<ModelNode> {
  range: ModelRange;
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

  constructor({
                root,
                start = root,
                end,
                descend = true,
                visitParentUpwards = false,
                filter = () => FilterResult.FILTER_ACCEPT,
                reverse = false
              }: GenTreeWalkerConfig<T>) {
    this._root = root;
    this._start = start;
    this._end = end;
    this.descend = descend;
    if (end && !descend) {
      throw new NotImplementedError("It is currently not supported to disable descending while also providing an explicit endNode.");
    }
    this.visitParentUpwards = visitParentUpwards;
    this._filter = filter;
    this._reverse = reverse;
    this._currentNode = null;
    this._isAtEnd = false;
  }


  static fromSubTree<U extends Walkable>(config: RootTreeWalkerConfig<U>): GenTreeWalker<U> {
    return new GenTreeWalker<U>({...config, start: undefined, end: undefined});
  }

  static fromStartEnd<U extends Walkable>(config: StartEndTreeWalkerConfig<U>) {
    return new GenTreeWalker<U>(config);
  }

  get root(): T {
    return this._root;
  }

  get currentNode(): T | null {
    return this._currentNode as T | null;
  }

  * nodes(): Generator<T> {
    let result = this.nextNode();
    while (result) {
      yield result;
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
      // as long as we dont get a reject, go depth first into the child tree
      // if descend is false, don't do this (used to iterate over the toplevel nodes of a range)
      const child = this.getFirstChild(node, reverse);
      while (this.descend && child) {
        node = child;
        result = this.filterNode(node);
        if (result === FilterResult.FILTER_ACCEPT) {
          // we've found an acceptable node, save it and return it
          return node as T | null;
        }
      }

      // at this point we've gone as deep as we can but haven't found a node yet
      // so we start going sideways or back up
      let sibling = null;
      let temporary: Walkable | null = node;
      while (temporary) {
        if (temporary === this.root) {
          return null;
        }
        // try going sideways first
        sibling = this.getNextSibling(temporary, reverse);
        if (sibling) {
          // there was a sibling, break here
          node = sibling;
          break;
        }
        // walk back up and try to find a sibling there
        // we don't care about these nodes since we've already visited them
        // unless visitParentUpwards is true
        temporary = temporary.parentNode;
        if (this.visitParentUpwards && temporary) {
          result = this.filterNode(temporary);
          if (result === FilterResult.FILTER_ACCEPT) {
            return temporary as T | null;
          }
        }
      }
      // test the node we found (this was a sibling or a sibling of the parent)
      result = this.filterNode(node);
      if (result === FilterResult.FILTER_ACCEPT) {
        return node as T | null;
      }

      // the node did not qualify, we will visit its children on the next loop
    }
  }

  private getFirstChild(node: Walkable, reverse: boolean): Walkable | null {
    return reverse ? node.lastChild : node.firstChild;
  }

  private getLastChild(node: Walkable, reverse: boolean): Walkable | null {
    return reverse ? node.firstChild : node.firstChild;
  }

  private getNextSibling(node: Walkable, reverse: boolean): Walkable | null {
    return reverse ? node.previousSibling : node.nextSibling;
  }

  private filterNode(node: Walkable): FilterResult {
    if (!this._filter) {
      return FilterResult.FILTER_ACCEPT;
    }

    return this._filter(node as T);
  }

}

