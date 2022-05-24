import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelTreeWalker from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import RangeMapper, {
  LeftOrRight,
} from '@lblod/ember-rdfa-editor/model/range-mapper';
import { RelativePosition } from '@lblod/ember-rdfa-editor/model/util/types';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { test } from 'qunit';
import { nodeIsElementOfType } from '../util/predicate-utils';
import ModelElement from '../model-element';
import type from 'dummy/tests/integration/util/type-helper';

export type OperationAlgorithmResponse<T> = { mapper: RangeMapper } & T;
/**
 * A shared library of algorithms to be used by operations only
 * Any use outside of operations is not supported
 */

export default class OperationAlgorithms {
  static removeNew(
    range: ModelRange
  ): OperationAlgorithmResponse<{ removedNodes: ModelNode[] }> {
    if (range.collapsed) {
      return {
        removedNodes: [],
        mapper: new RangeMapper([buildPositionMapping(range, range.start)]),
      };
    }

    //config consts
    const cantMergeIntoTypes = ['a'];

    const cantRemoveOpeningTagNodeTypes = ['a', 'ul', 'li'];

    const cantRemoveRdfa = true;

    const cantRemoveOpeningTagNodes: ModelElement[] = [];
    const canteMergeInto = [];
    const cantRemoveRdfaNodes = [];

    range.normalize();

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

    const nodesToMove: ModelNode[] = [];
    let nextNode = range.end.nodeAfter();
    while (nextNode) {
      nodesToMove.push(nextNode);
      nextNode = nextNode.nextSibling;
    }

    const allNodes: ModelNode[] = [];
    const walker = new ModelTreeWalker({ range: range });
    for (const node of walker) {
      allNodes.push(node);
    }

    const confinedNodes: ModelNode[] = [];
    const confinedRanges = range.getMinimumConfinedRanges();
    for (const range of confinedRanges) {
      if (!range.collapsed) {
        const walker = new ModelTreeWalker({ range: range });
        confinedNodes.push(...walker);
      }
    }

    const openingTagNodes = allNodes.filter((node) => {
      if (confinedNodes.includes(node)) {
        return false;
      } else {
        return true;
      }
    });
    openingTagNodes.forEach((opNode) => {
      //check if we can remove it
      const cantRemove =
        ModelNode.isModelElement(opNode) &&
        cantRemoveOpeningTagNodeTypes.find((type) => type === opNode.type)
          ? true
          : false;

      if (cantRemove) {
        cantRemoveOpeningTagNodes.push(opNode);
      } else {
        const nodesToUnindent = (opNode as ModelElement).children;
        nodesToUnindent.forEach((node, index) => {
          if (opNode.index) {
            opNode.parent?.addChild(node, opNode.index + index);
          }
        });
        opNode.remove();
      }
    });

    confinedNodes.forEach((node) => {
      const cantRemove =
        cantRemoveRdfa &&
        ModelNode.isModelElement(node) &&
        node.getRdfaPrefixes().size > 0
          ? true
          : false;

      if (cantRemove) {
        cantRemoveRdfaNodes.push(node);
      } else {
        node.remove();
      }
    });

    const before = range.start.nodeBefore();

    const cantMerge = function () {
      if (cantMergeIntoTypes.find((type) => before?.findAncestorByType(type))) {
        return true;
      } else if (cantRemoveOpeningTagNodes.length > 0) {
        return true;
      } else {
        return false;
      }
    };
    if (!cantMerge() && before?.parent && before.index != null) {
      nodesToMove.forEach((node) => node.remove());
      before.parent.insertChildrenAtIndex(before.index + 1, ...nodesToMove);
    }

    //merge text nodes that end up next to each other
    const after = range.start.nodeAfter();
    if (before && after) {
      if (ModelNode.isModelText(before) && ModelNode.isModelText(after)) {
        this.mergeTextNodes([before]);
      }
    }
    return {
      removedNodes: [...confinedNodes, ...openingTagNodes],
      mapper: new RangeMapper([buildPositionMapping(range, range.start)]),
    };
  }

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
    const endParent = range.end.parent;

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
  ): OperationAlgorithmResponse<{
    overwrittenNodes: ModelNode[];
    _markCheckNodes: ModelNode[];
  }> {
    let overwrittenNodes: ModelNode[] = [];
    let newEndPos;
    let mapper: RangeMapper;
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
      newEndPos = ModelPosition.fromAfterNode(nodes[nodes.length - 1]);
      mapper = new RangeMapper([buildPositionMapping(range, newEndPos)]);
    } else {
      const { removedNodes, mapper: removeMapper } =
        OperationAlgorithms.remove(range);
      overwrittenNodes = removedNodes;
      const rangeAfterRemove = removeMapper.mapRange(range);
      const afterEnd = rangeAfterRemove.end.nodeAfter();
      const endParent = rangeAfterRemove.end.parent;

      rangeAfterRemove.start.parent.insertChildrenAtOffset(
        rangeAfterRemove.start.parentOffset,
        ...nodes
      );

      if (afterEnd) {
        newEndPos = ModelPosition.fromBeforeNode(afterEnd);
      } else {
        newEndPos = ModelPosition.fromInNode(
          endParent,
          endParent.getMaxOffset()
        );
      }
      mapper = removeMapper.appendMapper(
        new RangeMapper([buildPositionMapping(rangeAfterRemove, newEndPos)])
      );
    }
    return {
      overwrittenNodes,
      _markCheckNodes,
      mapper,
    };
  }

  static move(
    rangeToMove: ModelRange,
    targetPosition: ModelPosition
  ): OperationAlgorithmResponse<{
    movedNodes: ModelNode[];
    overwrittenNodes: ModelNode[];
    _markCheckNodes: ModelNode[];
  }> {
    const { removedNodes: nodesToMove, mapper: deletionMapper } =
      OperationAlgorithms.remove(rangeToMove);
    const targetRange = new ModelRange(targetPosition, targetPosition);
    if (nodesToMove.length) {
      const {
        overwrittenNodes,
        _markCheckNodes,
        mapper: insertionMapper,
      } = OperationAlgorithms.insert(targetRange, ...nodesToMove);
      return {
        mapper: deletionMapper.appendMapper(insertionMapper),
        overwrittenNodes,
        _markCheckNodes,
        movedNodes: nodesToMove,
      };
    }
    return {
      overwrittenNodes: [],
      _markCheckNodes: [],
      movedNodes: nodesToMove,
      mapper: deletionMapper,
    };
  }

  static splitText(
    position: ModelPosition,
    keepright = false
  ): OperationAlgorithmResponse<{ position: ModelPosition }> {
    position.split(keepright);
    return { position, mapper: new RangeMapper() };
  }

  static split(
    position: ModelPosition,
    keepright = false
  ): OperationAlgorithmResponse<{ position: ModelPosition }> {
    OperationAlgorithms.splitText(position, keepright);
    const parent = position.parent;
    if (parent === position.root) {
      return { position, mapper: new RangeMapper() };
    }
    const grandParent = parent.parent;
    if (!grandParent) {
      return { position, mapper: new RangeMapper() };
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
      return {
        position: ModelPosition.fromAfterNode(left),
        mapper: new RangeMapper([
          buildPositionMapping(
            new ModelRange(position, position),
            left.lastChild
              ? ModelPosition.fromAfterNode(left.lastChild)
              : ModelPosition.fromAfterNode(left)
          ),
        ]),
      };
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
      return {
        position: ModelPosition.fromBeforeNode(right),
        mapper: new RangeMapper([
          buildPositionMapping(
            new ModelRange(position, position),
            right.firstChild
              ? ModelPosition.fromBeforeNode(right.firstChild)
              : ModelPosition.fromBeforeNode(right)
          ),
        ]),
      };
    }
  }

  static mergeTextNodes(nodes: ModelText[]) {
    for (const node of nodes) {
      const sibling = node.nextSibling;
      if (
        sibling &&
        ModelNode.isModelText(sibling) &&
        node.isMergeable(sibling)
      ) {
        sibling.content = node.content + sibling.content;
        node.remove();
      }
    }
  }
}

function buildPositionMapping(
  affectedRange: ModelRange,
  newEndPosition: ModelPosition
) {
  const pathOffsets = newEndPosition.path.map(
    (val, index) => val - affectedRange.end.path[index]
  );
  return function (position: ModelPosition, bias: LeftOrRight = 'right') {
    if (position.compare(affectedRange.start) === RelativePosition.BEFORE) {
      return position;
    }
    if (position.compare(affectedRange.start) === RelativePosition.EQUAL) {
      if (bias === 'left') {
        return position;
      } else {
        return newEndPosition;
      }
    }

    if (
      [RelativePosition.AFTER, RelativePosition.EQUAL].includes(
        position.compare(affectedRange.end)
      )
    ) {
      const root = position.root;
      const path = [...position.path];
      const newPath: number[] = [];
      let outOfSubtree = false;
      path.forEach((value, index) => {
        if (outOfSubtree) {
          newPath.push(value);
        } else {
          if (
            pathOffsets[index] === 0 &&
            value !== affectedRange.end.path[index]
          ) {
            outOfSubtree = true;
            newPath.push(value);
          } else {
            newPath.push(value + (pathOffsets[index] ?? 0));
          }
        }
      });
      return ModelPosition.fromPath(root, newPath);
    } else {
      if (bias === 'left') {
        return affectedRange.start.clone();
      } else {
        return newEndPosition.clone(position.root);
      }
    }
  };
}
