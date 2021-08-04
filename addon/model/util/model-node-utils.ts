import MapUtils from "@lblod/ember-rdfa-editor/model/util/map-utils";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {LIST_CONTAINERS, PLACEHOLDER_CLASS, TABLE_CELLS} from "@lblod/ember-rdfa-editor/model/util/constants";

export default class ModelNodeUtils {
  static DEFAULT_IGNORED_ATTRS: Set<string> = new Set(["__dummy_test_attr", "__id", "data-editor-position-level", "data-editor-rdfa-position-level"]);

  static areAttributeMapsSame(map1: Map<string, string>, map2: Map<string, string>, ignore: Set<string> = ModelNodeUtils.DEFAULT_IGNORED_ATTRS): boolean {
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

  static isListContainer(node: ModelNode): node is ModelElement {
    return ModelNode.isModelElement(node) && LIST_CONTAINERS.has(node.type);
  }

  static isListElement(node: ModelNode | null): node is ModelElement {
    return ModelNode.isModelElement(node) && node.type === "li";
  }

  static isTableCell(node: ModelNode): node is ModelElement {
    return ModelNode.isModelElement(node) && TABLE_CELLS.has(node.type);
  }

  static isBr(node: ModelNode | null): node is ModelElement {
    return ModelNode.isModelElement(node) && node.type === "br";
  }

  static isTextRelated(node: ModelNode | null): boolean {
    return ModelNode.isModelText(node) || ModelNodeUtils.isBr(node);
  }

  static isPlaceHolder(node: ModelNode): node is ModelElement {
    return ModelNode.isModelElement(node) && !!node.getAttribute("class")?.includes(PLACEHOLDER_CLASS);
  }

  static findAncestor(node: ModelNode, predicate: (node: ModelNode) => boolean): ModelElement | null {
    let cur = node.parent;

    while (cur && !predicate(cur)) {
      cur = cur.parent;
    }

    return cur;
  }
}
