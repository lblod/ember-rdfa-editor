import MapUtils from '@lblod/ember-rdfa-editor/model/util/map-utils';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import {
  INVISIBLE_SPACE,
  LIST_CONTAINERS,
  LIST_TYPES,
  PLACEHOLDER_CLASS,
  TABLE_CELLS,
  VISUAL_NODES,
} from '@lblod/ember-rdfa-editor/model/util/constants';
import ModelText from '../model-text';
import StringUtils from './string-utils';

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
      node.content.split('').filter((c) => c !== INVISIBLE_SPACE).length;
      return node.length;
    } else if (node instanceof ModelElement && VISUAL_NODES.has(node.type)) {
      return 1;
    }
    return 0;
  }

  static getVisibleIndex(
    node: ModelText,
    steps: number,
    direction: number
  ): number {
    if (direction === 1) {
      let charactersAfter = node.content.substring(0, steps);
      let invisibleCount = StringUtils.getInvisibleSpaceCount(charactersAfter);
      let newInvisibleCount = invisibleCount;
      while (newInvisibleCount !== 0) {
        charactersAfter = node.content.substring(0, steps + invisibleCount);
        newInvisibleCount =
          StringUtils.getInvisibleSpaceCount(charactersAfter) - invisibleCount;
        invisibleCount += newInvisibleCount;
      }
      return charactersAfter.length;
    } else {
      let charactersBefore = node.content.substring(
        node.content.length - steps
      );
      let invisibleCount = StringUtils.getInvisibleSpaceCount(charactersBefore);
      let newInvisibleCount = invisibleCount;
      while (newInvisibleCount !== 0) {
        charactersBefore = node.content.substring(
          node.content.length - steps - invisibleCount
        );
        newInvisibleCount =
          StringUtils.getInvisibleSpaceCount(charactersBefore) - invisibleCount;
        invisibleCount += newInvisibleCount;
      }
      return node.length - charactersBefore.length;
    }
  }
}
