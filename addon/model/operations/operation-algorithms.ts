import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelTreeWalker from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import RangeMapper, {
  LeftOrRight,
} from '@lblod/ember-rdfa-editor/model/range-mapper';
import { RelativePosition } from '@lblod/ember-rdfa-editor/model/util/types';

export type OperationAlgorithmResponse<T> = { mapper: RangeMapper } & T;
/**
 * A shared library of algorithms to be used by operations only
 * Any use outside of operations is not supported
 */
export default class OperationAlgorithms {
  static remove(
    range: ModelRange
  ): OperationAlgorithmResponse<{ removedNodes: ModelNode[] }> {
    let newStartNode: ModelNode | null = null;
    let newEndNode: ModelNode | null = null;
    let splitStart = false;
    let splitEnd = false;
    if (range.start.isInsideText()) {
      range.start.split();
      splitStart = true;
    }
    if (range.end.isInsideText()) {
      range.end.split(true);
      splitEnd = true;
    }
    if (splitStart) {
      newStartNode = range.start.nodeAfter();
    }
    if (splitEnd) {
      newEndNode = range.end.nodeBefore();
    }
    const afterEnd = range.end.nodeAfter();
    const endParent = range.end.parent!;

    const nodesToRemove = [];

    const confinedRanges = range.getMinimumConfinedRanges();
    for (const range of confinedRanges) {
      if (!range.collapsed) {
        const walker = new ModelTreeWalker({ range, descend: false });
        nodesToRemove.push(...walker);
      }
    }

    if (!range.collapsed && newStartNode) {
      newStartNode.remove();
      newStartNode.parent!.removeDirty('content');
    }
    for (const node of nodesToRemove.filter(
      (node) => node !== newStartNode && node !== newEndNode
    )) {
      node.remove();
    }
    if (!range.collapsed && newEndNode) {
      newEndNode.remove();
      newEndNode.parent!.removeDirty('content');
    }

    let newEndPos;
    if (afterEnd) {
      newEndPos = ModelPosition.fromBeforeNode(afterEnd);
    } else {
      newEndPos = ModelPosition.fromInNode(endParent, endParent.getMaxOffset());
    }

    return {
      removedNodes: nodesToRemove,
      mapper: new RangeMapper([buildPositionMapping(range, newEndPos)]),
    };
  }

  static insert(
    range: ModelRange,
    ...nodes: ModelNode[]
  ): { overwrittenNodes: ModelNode[]; _markCheckNodes: ModelNode[] } {
    let overwrittenNodes: ModelNode[] = [];
    const _markCheckNodes: ModelNode[] = [...nodes];
    if (range.collapsed) {
      if (range.start.path.length === 0) {
        range.root.appendChildren(...nodes);
      } else {
        range.start.split();
        const before = range.start.nodeBefore();
        const after = range.start.nodeAfter();
        if (before) {
          _markCheckNodes.push(before);
        }
        if (after) {
          _markCheckNodes.push(after);
        }
        range.start.parent.insertChildrenAtOffset(
          range.start.parentOffset,
          ...nodes
        );
      }
    } else {
      overwrittenNodes = OperationAlgorithms.remove(range).removedNodes;

      range.start.parent.insertChildrenAtOffset(
        range.start.parentOffset,
        ...nodes
      );
    }
    return { overwrittenNodes, _markCheckNodes };
  }

  static move(
    rangeToMove: ModelRange,
    targetPosition: ModelPosition
  ): {
    movedNodes: ModelNode[];
    overwrittenNodes: ModelNode[];
    _markCheckNodes: ModelNode[];
  } {
    const nodesToMove = OperationAlgorithms.remove(rangeToMove).removedNodes;
    const targetRange = new ModelRange(targetPosition, targetPosition);
    if (nodesToMove.length) {
      return {
        ...OperationAlgorithms.insert(targetRange, ...nodesToMove),
        movedNodes: nodesToMove,
      };
    }
    return {
      overwrittenNodes: [],
      _markCheckNodes: [],
      movedNodes: nodesToMove,
    };
  }

  static splitText(position: ModelPosition, keepright = false) {
    position.split(keepright);
    return position;
  }

  static split(position: ModelPosition, keepright = false): ModelPosition {
    OperationAlgorithms.splitText(position, keepright);
    const parent = position.parent;
    if (parent === position.root) {
      return position;
    }
    const grandParent = parent.parent;
    if (!grandParent) {
      return position;
    }

    if (keepright) {
      const left = parent.shallowClone();
      const before = position.nodeBefore();
      if (before) {
        const leftSideChildren = parent.children.splice(0, before.index!);
        parent.addDirty('content');
        if (parent.firstChild) {
          parent.firstChild.previousSibling = null;
        }
        if (leftSideChildren[leftSideChildren.length - 1]) {
          leftSideChildren[leftSideChildren.length - 1].nextSibling = null;
        }
        left.appendChildren(...leftSideChildren);
      }
      grandParent.addChild(left, parent.index!);
      return ModelPosition.fromAfterNode(left);
    } else {
      const right = parent.shallowClone();
      const after = position.nodeAfter();
      if (after) {
        const rightSideChildren = parent.children.splice(after.index!);
        parent.addDirty('content');
        if (parent.lastChild) {
          parent.lastChild.nextSibling = null;
        }
        if (rightSideChildren[0]) {
          rightSideChildren[0].previousSibling = null;
        }
        right.appendChildren(...rightSideChildren);
      }
      grandParent.addChild(right, parent.index! + 1);
      return ModelPosition.fromBeforeNode(right);
    }
  }
}

function buildPositionMapping(
  affectedRange: ModelRange,
  newEndPosition: ModelPosition
) {
  const pathOffsets: number[] = [];
  newEndPosition.path.forEach((val, index) => {
    pathOffsets.push(val - affectedRange.end.path[index]);
  });
  return function (position: ModelPosition, bias?: LeftOrRight = 'right') {
    if (
      [RelativePosition.BEFORE, RelativePosition.EQUAL].includes(
        position.compare(affectedRange.start)
      )
    ) {
      return position;
    }
    if (
      [RelativePosition.AFTER, RelativePosition.EQUAL].includes(
        position.compare(affectedRange.end)
      )
    ) {
      const root = position.root;
      const path = [...position.path];
      path.forEach((val, index) => {
        path[index] = val + pathOffsets[index];
      });
      return ModelPosition.fromPath(root, path);
    } else {
      if (bias === 'left') {
        return affectedRange.start.clone();
      } else {
        return newEndPosition.clone(position.root);
      }
    }
  };
}

