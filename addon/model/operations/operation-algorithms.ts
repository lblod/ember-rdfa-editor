import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";

/**
 * A shared library of algorithms to be used by operations only
 * Any use outside of operations is not supported
 */
export default class OperationAlgorithms {
  static remove(range: ModelRange): ModelNode[] {

    const confinedRanges = range.getMinimumConfinedRanges();
    const nodesToRemove = [];
    for (const range of confinedRanges) {
      if(!range.collapsed) {
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

  static move(rangeToMove: ModelRange, targetRange: ModelRange): ModelNode[] {
    rangeToMove.start.split();
    rangeToMove.end.split();
    const nodes = OperationAlgorithms.remove(rangeToMove);
    if(nodes.length) {
      OperationAlgorithms.insert(targetRange, ...nodes);
    }
    return nodes;
  }

}
