import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/util/model-tree-walker";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";

/**
 * A shared library of algorithms to be used by operations only
 * Any use outside of operations is not supported
 */
export default class OperationAlgorithms {
  static remove(range: ModelRange): ModelNode[] {

    OperationAlgorithms.splitText(range.start);
    OperationAlgorithms.splitText(range.end);
    const confinedRanges = range.getMinimumConfinedRanges();
    const nodesToRemove = [];
    for (const range of confinedRanges) {
      if (!range.collapsed) {
        const walker = new ModelTreeWalker({range, descend: false});
        nodesToRemove.push(...walker);
      }
    }
    for (const node of nodesToRemove) {
      node.remove();
    }
    return nodesToRemove;
  }

  static insert(range: ModelRange, ...nodes: ModelNode[]) {
    if (range.collapsed) {
      if (range.start.path.length === 0) {
        range.root.appendChildren(...nodes);
      } else {
        range.start.split();
        range.start.parent.insertChildrenAtOffset(range.start.parentOffset, ...nodes);
      }
    } else {
      range.start.split();
      range.end.split();
      OperationAlgorithms.remove(range);

      range.start.parent.insertChildrenAtOffset(range.start.parentOffset, ...nodes);

    }
  }

  static move(rangeToMove: ModelRange, targetPosition: ModelPosition): ModelNode[] {
    const nodes = OperationAlgorithms.remove(rangeToMove);
    const targetRange = new ModelRange(targetPosition, targetPosition);
    if (nodes.length) {
      OperationAlgorithms.insert(targetRange, ...nodes);
    }
    return nodes;
  }

  static splitText(position: ModelPosition) {
    position.split();
    return position;
  }

  static split(position: ModelPosition): ModelPosition {
    OperationAlgorithms.splitText(position);
    const parent = position.parent;
    if (parent === position.root) {
      return position;
    }
    const grandParent = parent.parent;
    if (!grandParent) {
      return position;
    }

    const newNode = parent.shallowClone();
    const after = position.nodeAfter();
    if (after) {
      const rightSideChildren = parent.children.splice(after.index!);
      if(parent.lastChild) {
        parent.lastChild.nextSibling = null;
      }
      if(rightSideChildren[0]) {
        rightSideChildren[0].previousSibling = null;
      }
      newNode.appendChildren(...rightSideChildren);
    }
    grandParent.addChild(newNode, parent.index! + 1);
    return ModelPosition.fromBeforeNode(newNode);
  }

}
