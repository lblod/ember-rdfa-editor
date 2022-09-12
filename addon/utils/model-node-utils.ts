import MapUtils from '@lblod/ember-rdfa-editor/utils/map-utils';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import {
  INVISIBLE_SPACE,
  LIST_CONTAINERS,
  LIST_TYPES,
  LUMP_NODE_PROPERTY,
  PLACEHOLDER_CLASS,
  TABLE_CELLS,
  VISUAL_NODES,
} from '@lblod/ember-rdfa-editor/utils/constants';
import ModelText from '../model/model-text';
import StringUtils from './string-utils';
import { Direction } from './types';

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
    node: ModelNode | null,
    predicate: (node: ModelNode) => boolean,
    includeSelf = false
  ): ModelNode | null {
    if (!node) {
      return null;
    }

    let current = includeSelf ? node : node.parent;
    while (current && !predicate(current)) {
      current = current.parent;
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
  static siblingInDirection(node: ModelNode, direction: Direction) {
    if (direction === Direction.FORWARDS) {
      return node.nextSibling;
    } else {
      return node.previousSibling;
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

  static parentIsLumpNode(modelNode: ModelNode): boolean {
    while (modelNode.parent) {
      const properties = modelNode.parent.getRdfaAttributes().properties;
      if (properties && properties.includes(LUMP_NODE_PROPERTY)) {
        return true;
      }
      modelNode = modelNode.parent;
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
  static isInLumpNode(node: ModelNode): boolean {
    return !!ModelNodeUtils.getParentLumpNode(node);
  }
  static getParentLumpNode(node: ModelNode): ModelElement | void {
    // SAFETY: hesLumpNodeProperty filters out non-element nodes
    return node.findSelfOrAncestors(ModelNodeUtils.hasLumpNodeProperty).next()
      .value as ModelElement;
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
}
