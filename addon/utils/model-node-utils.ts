import MapUtils from '@lblod/ember-rdfa-editor/utils/map-utils';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import {
  INVISIBLE_SPACE,
  LIST_CONTAINERS,
  LIST_TYPES,
  LUMP_NODE_PROPERTY,
  PLACEHOLDER_CLASS,
  TABLE_CELLS,
  VISUAL_NODES,
} from '@lblod/ember-rdfa-editor/utils/constants';
import ModelText from '../core/model/nodes/model-text';
import StringUtils from './string-utils';
import { Direction } from './types';
import { AssertionError } from '@lblod/ember-rdfa-editor/utils/errors';
import unwrap from '@lblod/ember-rdfa-editor/utils/unwrap';
import ArrayUtils from '@lblod/ember-rdfa-editor/utils/array-utils';

export default class ModelNodeUtils {
  static DEFAULT_IGNORED_ATTRS: Set<string> = new Set([
    '__dummy_test_attr',
    '__id',
    '__dirty',
    'data-editor-position-level',
    'data-editor-rdfa-position-level',
  ]);

  static areAttributeMapsSame(
    map1: Map<string, string>,
    map2: Map<string, string>,
    ignore: Set<string> = ModelNodeUtils.DEFAULT_IGNORED_ATTRS
  ): boolean {
    const filtered1 = new Map();
    map1.forEach((val, key) => {
      if (!ignore.has(key)) {
        filtered1.set(key, val);
      }
    });

    const filtered2 = new Map();
    map2.forEach((val, key) => {
      if (!ignore.has(key)) {
        filtered2.set(key, val);
      }
    });

    return MapUtils.areMapsSame(filtered1, filtered2);
  }

  static isListRelated(node: ModelNode | null): node is ModelElement {
    return ModelNode.isModelElement(node) && LIST_TYPES.has(node.type);
  }

  static isListContainer(node: ModelNode | null): node is ModelElement {
    return ModelNode.isModelElement(node) && LIST_CONTAINERS.has(node.type);
  }

  static isListElement(node: ModelNode | null): node is ModelElement {
    return ModelNode.isModelElement(node) && node.type === 'li';
  }

  static isTableCell(node: ModelNode | null): node is ModelElement {
    return ModelNode.isModelElement(node) && TABLE_CELLS.has(node.type);
  }

  static isPlaceHolder(node: ModelNode): node is ModelElement {
    return (
      ModelNode.isModelElement(node) &&
      !!node.getAttribute('class')?.includes(PLACEHOLDER_CLASS)
    );
  }

  static findAncestor(
    root: ModelElement,
    node: ModelNode | null,
    predicate: (node: ModelNode) => boolean,
    includeSelf = false
  ): ModelNode | null {
    if (!node) {
      return null;
    }

    let current = includeSelf ? node : node.getParent(root);
    while (current && !predicate(current)) {
      current = current.getParent(root);
    }

    return current;
  }

  static getVisualLength(node: ModelNode): number {
    if (ModelNode.isModelText(node)) {
      return node.content.split('').filter((c) => c !== INVISIBLE_SPACE).length;
      // return node.length;
    } else if (
      (ModelNode.isModelElement(node) && VISUAL_NODES.has(node.type)) ||
      ModelNode.isModelInlineComponent(node)
    ) {
      return 1;
    }

    return 0;
  }

  static isVisible(node: ModelNode): boolean {
    return this.getVisualLength(node) > 0;
  }

  /**
   * Determines the index in the text node after having took a number of visual steps in a specific direction
   * from either the start or the end of the text node
   *
   * @param node The text node in which the index should be determined
   * @param steps The number of visual steps to take
   * @param forwards Whether to begin from the start of the node or the end
   * @returns The index in the text node after having took the provided number of visual steps
   */
  static getVisibleIndex(
    node: ModelText,
    steps: number,
    forwards: boolean
  ): number {
    const index = this.getIndex(node, steps, forwards);

    let nextCharacters = forwards
      ? node.content.substring(0, index)
      : node.content.substring(index);

    // The invisible spaces should be ignored and skipped over
    let invisibleCount = StringUtils.getInvisibleSpaceCount(nextCharacters);
    let newInvisibleCount = invisibleCount;

    // While new invisible spaces still occur, search further
    while (newInvisibleCount !== 0) {
      const index = this.getIndex(node, steps + invisibleCount, forwards);
      nextCharacters = forwards
        ? node.content.substring(0, index)
        : node.content.substring(index);
      newInvisibleCount =
        StringUtils.getInvisibleSpaceCount(nextCharacters) - invisibleCount;
      invisibleCount += newInvisibleCount;
    }

    return forwards
      ? nextCharacters.length
      : node.length - nextCharacters.length;
  }

  static getIndex(node: ModelText, steps: number, forwards: boolean) {
    return forwards ? steps : node.content.length - steps;
  }

  static siblingInDirection(
    root: ModelElement,
    node: ModelNode,
    direction: Direction
  ) {
    if (direction === Direction.FORWARDS) {
      return node.getNextSibling(root);
    } else {
      return node.getPreviousSibling(root);
    }
  }

  static getTextContent(node: ModelNode): string {
    if (ModelNode.isModelElement(node)) {
      let result = '';
      node.children.forEach((child) => {
        result += ModelNodeUtils.getTextContent(child);
      });
      return result;
    } else if (ModelNode.isModelText(node)) {
      return node.content;
    } else {
      return '';
    }
  }

  static parentIsLumpNode(root: ModelElement, modelNode: ModelNode): boolean {
    let parent = modelNode.getParent(root);
    while (parent) {
      const properties = parent.getRdfaAttributes().properties;
      if (properties && properties.includes(LUMP_NODE_PROPERTY)) {
        return true;
      }
      parent = parent.getParent(root);
    }
    return false;
  }

  static isLumpNode(modelElement: ModelElement): boolean {
    const properties = modelElement.getRdfaAttributes().properties;
    if (properties && properties.includes(LUMP_NODE_PROPERTY)) {
      return true;
    }
    return false;
  }

  static isInLumpNode(root: ModelElement, node: ModelNode): boolean {
    return !!ModelNodeUtils.getParentLumpNode(root, node);
  }

  static getParentLumpNode(
    root: ModelElement,
    node: ModelNode
  ): ModelElement | void {
    // SAFETY: hesLumpNodeProperty filters out non-element nodes
    return node
      .findSelfOrAncestors(root, ModelNodeUtils.hasLumpNodeProperty)
      .next().value as ModelElement;
  }

  static hasLumpNodeProperty(node: ModelNode): node is ModelElement {
    if (!ModelNode.isModelElement(node)) {
      return false;
    }
    const attrs = node.getRdfaAttributes();
    if (!attrs.properties) {
      return false;
    }
    return attrs.properties.indexOf(LUMP_NODE_PROPERTY) > -1;
  }

  static replaceNodeInTree(
    root: ModelElement,
    nodeToReplace: ModelNode,
    newNode: ModelNode
  ): ModelElement {
    if (nodeToReplace === root) {
      ModelNode.assertModelElement(newNode);
      return newNode;
    }
    const path = ModelNodeUtils.pathFromRoot(root, nodeToReplace);
    const clonedPath = ModelNodeUtils.shallowCloneNodePath(path);
    if (path.length !== clonedPath.length) {
      throw new AssertionError(
        'Erroneous path from root to target node, contains a leafnode'
      );
    }
    const newRoot = clonedPath[0];
    ModelNode.assertModelElement(newRoot);

    const parentOfNodeToReplace = nodeToReplace.getParent(root);
    ModelNode.assertModelElement(parentOfNodeToReplace);
    const parentClone = unwrap(ArrayUtils.lastItem(clonedPath));
    ModelNode.assertModelElement(parentClone);

    for (const child of parentOfNodeToReplace.children) {
      if (child === nodeToReplace) {
        parentClone.addChild(newNode);
      } else {
        parentClone.addChild(child);
      }
    }
    return newRoot;
  }

  static shallowCloneNodePath(path: ModelNode[]): ModelNode[] {
    const result = [];
    if (path.length === 1) {
      if (path[0].isLeaf) {
        result.push(path[0].clone());
      } else {
        ModelNode.assertModelElement(path[0]);
        result.push(path[0].shallowClone());
      }
    } else {
      let cur = path[0];
      if (cur.isLeaf) {
        result.push(cur.clone());
      } else {
        // SAFETY: we check for isLeaf, which implies element-ness
        ModelNode.assertModelElement(cur);
        let curClone = cur.shallowClone();
        result.push(curClone);

        for (const node of path.slice(1, path.length - 1)) {
          if (node.isLeaf) {
            result.push(node.clone());
            return result;
          } else {
            ModelNode.assertModelElement(cur);
            ModelNode.assertModelElement(node);
            const nodeClone = node.shallowClone();
            for (const child of cur.children) {
              if (child === node) {
                curClone.addChild(nodeClone);
                result.push(nodeClone);
              } else {
                curClone.addChild(child);
              }
            }
            cur = node;
            curClone = nodeClone;
          }
        }
        const last = path[path.length - 1];
        ModelNode.assertModelElement(cur);
        const lastClone = last.isLeaf
          ? last.clone()
          : (last as ModelElement).shallowClone();
        for (const child of cur.children) {
          if (child === last) {
            curClone.addChild(lastClone);
            result.push(lastClone);
          } else {
            curClone.addChild(child);
          }
        }
      }
    }
    return result;
  }

  static pathFromRoot(
    root: ModelElement,
    node: ModelNode,
    includeTarget = false
  ): ModelNode[] {
    let result: ModelNode[] = [];
    if (root === node) {
      return [root];
    }
    if (includeTarget) {
      result = [node];
    }
    let cur = node.getParent(root);
    while (cur) {
      result.push(cur);
      cur = cur.getParent(root);
    }
    return result.reverse();
  }
}
export function tag(node: ModelNode): string {
  return node.type;
}
export function children(node: ModelNode): Iterable<ModelNode> {
  ModelNode.assertModelElement(node);
  return node.children;
}
export function textContent(node: ModelNode): string {
  ModelNode.assertModelText(node);
  return node.content;
}
export function isText(node: ModelNode): boolean {
  return ModelNode.isModelText(node);
}
export function attributes(node: ModelNode): Record<string, string> {
  return Object.fromEntries(node.attributeMap.entries());
}
export function getParent(node: ModelNode, root: ModelNode): ModelNode | null {
  ModelNode.assertModelElement(root);
  return node.getParent(root);
}
