import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/model/nodes/model-node';
import GenTreeWalker from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import ModelTreeWalker, {
  toFilterSkipFalse,
} from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import RangeMapper, {
  LeftOrRight,
} from '@lblod/ember-rdfa-editor/model/range-mapper';
import { RelativePosition } from '@lblod/ember-rdfa-editor/utils/types';
import ModelText from '@lblod/ember-rdfa-editor/model/nodes/model-text';

export type OperationAlgorithmResponse<T> = { mapper: RangeMapper } & T;
/**
 * A shared library of algorithms to be used by operations only
 * Any use outside of operations is not supported
 */

//config consts for removeNew algo
const cantMergeIntoTypes = new Set<string>([
  'a',
  'table',
  'tr',
  'th',
  'thead',
  'tbody',
]);

const cantRemoveOpeningTagNodeTypes = new Set<string>([
  'a',
  'td',
  'tr',
  'table',
  'thead',
  'tbody',
  'th',
]);

export default class OperationAlgorithms {
  static removeNew(
    range: ModelRange
  ): OperationAlgorithmResponse<{ removedNodes: ModelNode[] }> {
    //start algorithm
    if (range.collapsed) {
      return {
        removedNodes: [],
        mapper: new RangeMapper([buildPositionMapping(range, range.start)]),
      };
    }

    //split end and start if they are inside a text node
    if (range.start.isInsideText()) {
      range.start.split();
    }
    if (range.end.isInsideText()) {
      range.end.split(true);
    }

    //get nodes that will move after the delition operation
    //these are siblings of the closest node to the end of the range (if any)
    //assumption: nodeAfter doesn't grab anything if the next node to the end of the range is one level up
    const nodesToMove: ModelNode[] = [];
    let nextNode = range.end.nodeAfter();

    while (nextNode) {
      nodesToMove.push(nextNode);
      nextNode = nextNode.nextSibling;
    }

    //grab all nodes inside the range
    //assumption: the only partial nodes that treewalker grabs are the ones that have opening tags in the selection
    //assumption: opening tag nodes are always parents of the last node in range
    const walker = GenTreeWalker.fromRange({
      range: range,
      filter: toFilterSkipFalse((node) => ModelNode.isModelElement(node)),
    });
    const allNodes = [...walker.nodes()];

    //get all nodes that are fully contained in the range
    //ie [<span><text>abc</text>]</span>
    //would grab just the text node
    const confinedNodes: ModelNode[] = [];
    const confinedRanges = range.getMinimumConfinedRanges();
    for (const range of confinedRanges) {
      if (!range.collapsed) {
        const walker = GenTreeWalker.fromRange({ range: range });
        confinedNodes.push(...walker.nodes());
      }
    }

    //get all the nodes that have only the opening tags in the range
    const openingTagNodes = allNodes.filter((node) => {
      if (confinedNodes.includes(node)) {
        return false;
      } else {
        return true;
      }
    });

    //remove all the opening tag nodes and unwrap their contents
    //ie: <div>[<span><text>abc</text>]</span></div>
    //will become: <div><text>abc</text></div>
    //avoid doing this to nodes that we dont want to remove as stated in the begining of the function
    //dont do this to rdfa either
    //collect those nodes

    const cantRemoveOpeningTagNodes: ModelNode[] = [];

    openingTagNodes.forEach((opNode) => {
      //check if we can remove it
      if (ModelNode.isModelElement(opNode)) {
        const cantRemove =
          cantRemoveOpeningTagNodeTypes.has(opNode.type) ||
          !opNode.getRdfaAttributes().isEmpty;
        if (cantRemove) {
          cantRemoveOpeningTagNodes.push(opNode);
        } else {
          opNode.unwrap();
        }
      } else {
        throw new Error('opening tag node is not an element, deletion failed');
      }
    });

    //remove nodes that are fully confined in the selection
    confinedNodes.forEach((node) => {
      node.remove();
    });

    //merge the nodes we collected before (siblings at the end position) to the start position
    //unless if the start position is a descendant of one of the tags we dont merge into
    const parent = range.start.parent;

    let index;
    const nodeBefore = range.start.nodeBefore();
    const nodeAfter = range.start.nodeAfter();
    if (nodeBefore) {
      index = nodeBefore.index! + 1;
    } else if (nodeAfter) {
      index = nodeAfter.index!;
    } else {
      index = 0;
    }

    let merge;

    merge = !parent
      .findSelfOrAncestors(
        (node) =>
          ModelNode.isModelElement(node) && cantMergeIntoTypes.has(node.type)
      )
      .next().value;

    //if there are nodes with opening tags we cant remove they are parents of the moved nodes
    //merging nodes that cant be removed is iffy, this should probably change but needs some thought
    //maybe a truth table of what can be merged into what?
    if (merge) {
      merge = cantRemoveOpeningTagNodes.length === 0;
    }

    if (merge) {
      nodesToMove.forEach((node) => node.remove());
      parent.insertChildrenAtIndex(index, ...nodesToMove);
    }

    //merge text nodes that end up next to each other
    const after = range.start.nodeAfter();
    const before = range.start.nodeBefore();
    if (before && after) {
      if (ModelNode.isModelText(before) && ModelNode.isModelText(after)) {
        this.mergeTextNodes([before]);
      }
    }

    //not sure i did this correcctly
    const removedOpeningTagNodes = openingTagNodes.filter((node) => {
      return !cantRemoveOpeningTagNodes.includes(node);
    });

    return {
      removedNodes: [...confinedNodes, ...removedOpeningTagNodes],
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
    }
    for (const node of nodesToRemove.filter(
      (node) => node !== newStartNode && node !== newEndNode
    )) {
      node.remove();
    }
    if (!range.collapsed && newEndNode) {
      newEndNode.remove();
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
