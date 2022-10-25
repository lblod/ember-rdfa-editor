/**
 * TreeWalker implementation based on specification of the TreeWalker in the DOM spec, but for ModelNodes
 * and working with a {@link ModelRange}.
 * https://dom.spec.whatwg.org/#interface-treewalker
 *
 * Extensions include support for stopping at an end node, the implementation of the Iterable interface.
 */
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { Walkable, WalkFilter } from './gen-tree-walker';
import unwrap from '@lblod/ember-rdfa-editor/utils/unwrap';

export enum FilterResult {
  // We like the node.
  FILTER_ACCEPT,
  // We don't want the node, but we want to visit its child tree.
  FILTER_SKIP,
  // We don't want the entire subtree, so skip the node and don't visit its children.
  FILTER_REJECT,
}

enum TraverseType {
  FIRST,
  LAST,
}

export type ModelNodeFilter = (node: ModelNode) => FilterResult;

/**
 * Utility function to turn a boolean filter into a filter that is compatible with the TreeWalker.
 * If the provided filter function returns false, the node will be skipped (but it's children
 * will be visited).
 * @param func
 */
export function toFilterSkipFalse<N extends Walkable>(
  func: (node: N) => boolean
): WalkFilter<N> {
  return function (node: N) {
    return func(node) ? FilterResult.FILTER_ACCEPT : FilterResult.FILTER_SKIP;
  };
}

/**
 * Utility function to turn a boolean filter into a filter that is compatible with the TreeWalker.
 * If the provided filter function returns false, the node will be rejected (aka
 * it's children will not be visited at all).
 * @param func
 */
export function toFilterRejectFalse(
  func: (node: ModelNode) => boolean
): ModelNodeFilter {
  return function (node: ModelNode) {
    return func(node) ? FilterResult.FILTER_ACCEPT : FilterResult.FILTER_REJECT;
  };
}

export interface ModelTreeWalkerConfig {
  filter?: ModelNodeFilter;
  range: ModelRange;
  descend?: boolean;
  visitParentUpwards?: boolean;
}

export default class ModelTreeWalker<T extends ModelNode = ModelNode>
  implements Iterable<T>
{
  private readonly _root: ModelElement;
  private readonly _filter?: ModelNodeFilter;
  private _currentNode: ModelNode | null;

  private readonly nodeAfterEnd: ModelNode | null = null;
  private readonly descend: boolean;
  private readonly visitParentUpwards: boolean;

  private hasReturnedStartNode = false;
  private hasSeenEnd = false;

  constructor({
    filter,
    range,
    descend = true,
    visitParentUpwards = false,
  }: ModelTreeWalkerConfig) {
    const { start: from, end: to } = range;
    this._root = range.root;
    this._filter = filter;
    this.descend = descend;
    this.visitParentUpwards = visitParentUpwards;

    if (from.path.length > 0) {
      const startNode = this.getStartNodeFromPosition(from);
      this.nodeAfterEnd = startNode
        ? this.getNodeAfterEndFromPosition(to, startNode)
        : null;
      this._currentNode = startNode;
    } else {
      this._currentNode = this.root;
    }
  }

  get root(): ModelElement {
    return this._root;
  }

  get currentNode(): ModelNode | null {
    return this._currentNode;
  }

  [Symbol.iterator](): Iterator<T> {
    return {
      next: (): IteratorResult<T> => {
        if (!this._currentNode) {
          return { value: null, done: true };
        }

        if (!this.hasReturnedStartNode) {
          this.hasReturnedStartNode = true;
          if (
            this.filterNode(this._currentNode) === FilterResult.FILTER_ACCEPT
          ) {
            return { value: this._currentNode as T, done: false };
          }
        }

        const value = this.nextNode() as T;
        if (value) {
          return { value, done: false };
        } else {
          return { value: null, done: true };
        }
      },
    };
  }

  parentNode(): ModelElement | null {
    let node: ModelNode | null = this._currentNode;

    while (node && node !== this.root) {
      node = node.getParent(this.root);
      if (node && this.filterNode(node) === FilterResult.FILTER_ACCEPT) {
        this._currentNode = node;
        return node as ModelElement;
      }
    }

    return null;
  }

  firstChild(): ModelNode | null {
    return this.traverseChildren(TraverseType.FIRST);
  }

  lastChild(): ModelNode | null {
    return this.traverseChildren(TraverseType.LAST);
  }

  nextSibling(): ModelNode | null {
    return this.traverseSiblings(TraverseType.FIRST);
  }

  previousSibling(): ModelNode | null {
    return this.traverseSiblings(TraverseType.LAST);
  }

  previousNode(): ModelNode | null {
    if (!this._currentNode) {
      return null;
    }

    let node = this._currentNode;
    while (node !== this.root) {
      let sibling = node.getPreviousSibling(this.root);

      while (sibling) {
        node = sibling;
        let result = this.filterNode(node);
        while (result !== FilterResult.FILTER_REJECT && this.hasChild(node)) {
          node = node.lastChild!;
          result = this.filterNode(node);
        }

        if (result === FilterResult.FILTER_ACCEPT) {
          this._currentNode = node;
          return node;
        }

        sibling = node.getPreviousSibling(this.root);
      }

      if (node === this.root || !node.getParent(this.root)) {
        return null;
      }

      node = unwrap(node.getParent(this.root));
      if (this.filterNode(node) === FilterResult.FILTER_ACCEPT) {
        this._currentNode = node;
        return node;
      }
    }

    return null;
  }

  /**
   * Main iterator driver. This visits the nodes in document order.
   * Algorithm is heavily based on the dom spec, with a few modifications.
   * On the surface some of the control flow choices may seem odd, but I trust
   * that the DOM people know what they're doing.
   */
  nextNode(): ModelNode | null {
    if (!this._currentNode || this.hasSeenEnd) {
      // Stop when there is no current node or we have seen the last node.
      return null;
    }

    // Start at the currentNode, which is the node we ended on the last time
    // this method was run.
    let node = this._currentNode;

    let result = FilterResult.FILTER_ACCEPT;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // as long as we dont get a reject, go depth first into the child tree
      // if descend is false, don't do this (used to iterate over the toplevel nodes of a range)
      while (
        this.descend &&
        result !== FilterResult.FILTER_REJECT &&
        this.hasChild(node)
      ) {
        node = node.firstChild;
        result = this.filterNode(node);
        if (result === FilterResult.FILTER_ACCEPT) {
          // We've found an acceptable node, save it and return it.
          this._currentNode = node;
          return node;
        }
      }

      // At this point we've gone as deep as we can but haven't found a node yet,
      // so we start going sideways or back up.
      let sibling = null;
      let temporary: ModelNode | null = node;
      while (temporary) {
        if (temporary === this.root) {
          return null;
        }

        // Try going sideways first.
        sibling = temporary.getNextSibling(this.root);
        if (sibling) {
          // There was a sibling, break here.
          node = sibling;
          break;
        }

        // Walk back up and try to find a sibling there.
        // We don't care about these nodes since we've already visited them.
        temporary = temporary.getParent(this.root);
        if (this.visitParentUpwards && temporary) {
          result = this.filterNode(temporary);
          if (result === FilterResult.FILTER_ACCEPT) {
            this._currentNode = temporary;
            return temporary;
          }
        }
      }

      // Test the node we found (this was a sibling or a sibling of the parent).
      result = this.filterNode(node);
      if (result === FilterResult.FILTER_ACCEPT) {
        this._currentNode = node;
        return node;
      }

      // The node did not qualify, we will visit its children on the next loop.
    }
  }

  private getStartNodeFromPosition(
    startPosition: ModelPosition
  ): ModelNode | null {
    let startNode = startPosition.nodeAfter();
    if (startNode) {
      return startNode;
    }
    startNode = startPosition.parent;
    if (!startNode) {
      return this.root;
    }
    while (!startNode.getNextSibling(this.root) && startNode !== this.root) {
      startNode = unwrap(startNode.getParent(this.root));
    }

    // This would mean the given range is empty.
    if (startNode === this.root) {
      return null;
      // return startNode;
    }
    return unwrap(startNode.getNextSibling(this.root));
  }

  private getNodeAfterEndFromPosition(
    position: ModelPosition,
    startNode: ModelNode
  ): ModelNode | null {
    let nodeAfterEnd = position.nodeAfter();
    if (nodeAfterEnd) {
      if (
        position.parentOffset - nodeAfterEnd.getOffset(this.root) > 0 ||
        nodeAfterEnd === startNode
      ) {
        nodeAfterEnd = nodeAfterEnd.getNextSibling(this.root);
      }

      if (nodeAfterEnd) {
        return nodeAfterEnd;
      }
    }

    nodeAfterEnd = position.parent;
    if (!nodeAfterEnd) {
      return null;
    }

    while (
      !nodeAfterEnd.getNextSibling(this.root) &&
      nodeAfterEnd !== this.root
    ) {
      nodeAfterEnd = unwrap(nodeAfterEnd.getParent(this.root));
    }

    if (nodeAfterEnd === this.root) {
      return null;
    }

    nodeAfterEnd = nodeAfterEnd.getNextSibling(this.root);
    if (nodeAfterEnd === startNode) {
      return nodeAfterEnd.getNextSibling(this.root);
    }

    return nodeAfterEnd;
  }

  private traverseChildren(traverseType: TraverseType): ModelNode | null {
    if (!this._currentNode) {
      return null;
    }

    let node = this.getChild(this._currentNode, traverseType);
    while (node) {
      const result = this.filterNode(node);
      if (result === FilterResult.FILTER_ACCEPT) {
        this._currentNode = node;
        return node;
      } else if (result === FilterResult.FILTER_SKIP) {
        const child = this.getChild(node, traverseType);
        if (child) {
          node = child;
          continue;
        }
      } else {
        throw new NotImplementedError('Unknown filter result');
      }

      while (node) {
        const sibling = this.getSibling(node, traverseType);
        if (sibling) {
          node = sibling;
          break;
        }

        const parent: ModelElement | null = node.getParent(this.root);
        if (!parent || parent === this.root || parent === this._currentNode) {
          return null;
        }
        node = parent;
      }
    }

    return null;
  }

  private traverseSiblings(traverseType: TraverseType): ModelNode | null {
    if (!this._currentNode) {
      return null;
    }

    let node: ModelNode | null = this._currentNode;
    if (node === this.root) {
      return null;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let sibling = this.getSibling(node, traverseType);
      while (sibling) {
        node = sibling;
        const result = this.filterNode(node);
        if (result === FilterResult.FILTER_ACCEPT) {
          this._currentNode = node;
          return node;
        }

        sibling = this.getChild(node, traverseType);
        if (result === FilterResult.FILTER_REJECT || !sibling) {
          sibling = this.getSibling(node, traverseType);
        }
      }

      node = node.getParent(this.root);
      if (!node || node === this.root) {
        return null;
      }

      if (this.filterNode(node) === FilterResult.FILTER_ACCEPT) {
        return null;
      }
    }
  }

  private getSibling(
    node: ModelNode,
    traverseType: TraverseType
  ): ModelNode | null {
    if (traverseType === TraverseType.FIRST) {
      return node.getNextSibling(this.root);
    } else {
      return node.getPreviousSibling(this.root);
    }
  }

  private getChild(
    node: ModelNode,
    traverseType: TraverseType
  ): ModelNode | null {
    if (!ModelNode.isModelElement(node)) {
      return null;
    }

    if (traverseType === TraverseType.FIRST) {
      return node.firstChild;
    } else {
      return node.lastChild;
    }
  }

  private hasChild(node: ModelNode): node is ModelElement {
    return ModelNode.isModelElement(node) && node.length > 0;
  }

  private filterNode(node: ModelNode): FilterResult {
    if (this.hasSeenEnd || node === this.nodeAfterEnd) {
      this.hasSeenEnd = true;
      return FilterResult.FILTER_REJECT;
    }

    if (!this._filter) {
      return FilterResult.FILTER_ACCEPT;
    }

    return this._filter(node);
  }
}
