/**
 * TreeWalker implementation as specified in the DOM spec, but for ModelNodes
 * and working with modelpositions
 * https://dom.spec.whatwg.org/#interface-treewalker
 */
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {ModelError, NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

export enum FilterResult {
  FILTER_ACCEPT,
  FILTER_SKIP,
  FILTER_REJECT
}

enum TraverseType {
  FIRST, LAST
}

export type ModelNodeFilter = (node: ModelNode) => FilterResult;

export interface ModelTreeWalkerConfig {
  filter?: ModelNodeFilter;
  range: ModelRange;
}

export class ModelTreeWalker implements Iterable<ModelNode> {
  private readonly _root: ModelElement;
  private readonly _filter?: ModelNodeFilter;
  private _currentNode: ModelNode;
  private hasReturnedStartNode: boolean = false;
  private readonly nodeAfterEnd: ModelNode | null = null;
  private hasSeenEnd: boolean = false;

  constructor(config: ModelTreeWalkerConfig) {
    const {filter, range} = config;
    const {start: from, end: to} = range;
    this._root = range.root;
    this._filter = filter;

    if (from.path.length > 0) {

      const startNode = this.getStartNodeFromPosition(from);
      this.nodeAfterEnd = this.getNodeAfterEndFromPosition(to, startNode);
      this._currentNode = startNode;
    } else {
      this._currentNode = this.root;
    }
  }

  [Symbol.iterator](): Iterator<ModelNode> {
    return {
      next: (): IteratorResult<ModelNode> => {
        if (!this.hasReturnedStartNode) {
          this.hasReturnedStartNode = true;
          if (this.filterNode(this._currentNode) === FilterResult.FILTER_ACCEPT) {
            return {value: this._currentNode, done: false};
          }
        }
        const value = this.nextNode();
        if (value) {
          return {
            value, done: false
          };
        } else {
          return {
            value: null,
            done: true
          };
        }
      }
    };
  }

  get root(): ModelElement {
    return this._root;
  }

  get currentNode(): ModelNode | null {
    return this._currentNode;
  }

  parentNode(): ModelElement | null {
    let node: ModelNode | null = this._currentNode;
    while (node && node !== this.root) {
      node = node.parent;
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
    let node = this._currentNode;
    while (node !== this.root) {
      let sibling = node.previousSibling;

      while (sibling) {
        node = sibling;
        let result = this.filterNode(node);
        while (result !== FilterResult.FILTER_REJECT && this.hasChild(node)) {
          node = node.lastChild;
          result = this.filterNode(node);
        }
        if (result === FilterResult.FILTER_ACCEPT) {
          this._currentNode = node;
          return node;
        }
        sibling = node.previousSibling;
      }
      if (node === this.root || !node.parent) {
        return null;
      }
      node = node.parent;
      if (this.filterNode(node) === FilterResult.FILTER_ACCEPT) {
        this._currentNode = node;
        return node;
      }
    }
    return null;
  }

  nextNode(): ModelNode | null {
    if (this.hasSeenEnd) {
      return null;
    }
    let node = this._currentNode;
    let result = FilterResult.FILTER_ACCEPT;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      while (result !== FilterResult.FILTER_REJECT && this.hasChild(node)) {
        node = node.firstChild;
        result = this.filterNode(node);
        if (result === FilterResult.FILTER_ACCEPT) {
          this._currentNode = node;
          return node;
        }
      }
      let sibling = null;
      let temporary: ModelNode | null = node;
      while (temporary) {
        if (temporary === this.root) {
          return null;
        }
        sibling = temporary.nextSibling;
        if (sibling) {
          node = sibling;
          break;
        }
        temporary = temporary.parent;
      }
      result = this.filterNode(node);
      if (result === FilterResult.FILTER_ACCEPT) {
        this._currentNode = node;
        return node;
      }

    }

  }

  private getStartNodeFromPosition(startPosition: ModelPosition): ModelNode {
    let startNode = startPosition.nodeAfter();
    if (startNode) {
      return startNode;
    }
    startNode = startPosition.parent;
    if (!startNode) {
      return this.root;
    }
    while (!startNode.nextSibling && startNode !== this.root) {
      startNode = startNode.parent!;
    }
    if (startNode === this.root) {
      return startNode;
    }
    return startNode!.nextSibling!;
  }

  private getNodeAfterEndFromPosition(position: ModelPosition, startNode: ModelNode): ModelNode | null {
    let nodeAfterEnd = position.nodeAfter();
    if (nodeAfterEnd) {
      if(position.parentOffset - nodeAfterEnd.getOffset() > 0)  {
        nodeAfterEnd = nodeAfterEnd.nextSibling;
      }
      if(nodeAfterEnd) {
        return nodeAfterEnd;

      }
    }
    nodeAfterEnd = position.parent;
    if (!nodeAfterEnd) {
      return null;
    }
    while (!nodeAfterEnd.nextSibling && nodeAfterEnd !== this.root) {
      nodeAfterEnd = nodeAfterEnd!.parent!;
    }
    if(nodeAfterEnd === this.root) {
      return null;
    }
    nodeAfterEnd = nodeAfterEnd!.nextSibling;
    if(nodeAfterEnd === startNode) {
      return nodeAfterEnd.nextSibling;
    }
    return nodeAfterEnd;
  }

  private traverseChildren(traverseType: TraverseType): ModelNode | null {
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
        throw new NotImplementedError("Unknown filter result");
      }
      while (node) {
        const sibling = this.getSibling(node, traverseType);
        if (sibling) {
          node = sibling;
          break;
        }
        const parent: ModelElement | null = node.parent;
        if (!parent || parent === this.root || parent === this._currentNode) {
          return null;
        }
        node = parent;
      }
    }
    return null;
  }

  private traverseSiblings(traverseType: TraverseType): ModelNode | null {
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
      node = node.parent;
      if (!node || node === this.root) {
        return null;
      }
      if (this.filterNode(node) === FilterResult.FILTER_ACCEPT) {
        return null;
      }

    }

  }

  private getSibling(node: ModelNode, traverseType: TraverseType): ModelNode | null {
    if (traverseType === TraverseType.FIRST) {
      return node.nextSibling;
    } else {
      return node.previousSibling;
    }
  }

  private getChild(node: ModelNode, traverseType: TraverseType): ModelNode | null {
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
