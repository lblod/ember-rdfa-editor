import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import GenTreeWalker from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import ModelTreeWalker, {
  toFilterSkipFalse,
} from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import {
  LeftOrRight,
  SimplePositionMapping,
  SimpleRangeMapper,
} from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import {
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import {
  modelPosToSimplePos,
  SimplePosition,
  simplePosToModelPos,
} from '@lblod/ember-rdfa-editor/core/model/simple-position';

export type OperationAlgorithmResponse<T> = { mapper: SimpleRangeMapper } & T;
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
    root: ModelElement,
    range: SimpleRange
  ): OperationAlgorithmResponse<{ removedNodes: ModelNode[] }> {
    //start algorithm
    const modelRange = simpleRangeToModelRange(range, root);
    if (modelRange.collapsed) {
      return {
        removedNodes: [],
        mapper: new SimpleRangeMapper([
          buildPositionMappingForInsert(range.start, range.end, 0),
        ]),
      };
    }

    //split end and start if they are inside a text node
    if (modelRange.start.isInsideText()) {
      modelRange.start.split();
    }
    if (modelRange.end.isInsideText()) {
      modelRange.end.split(true);
    }

    //get nodes that will move after the delition operation
    //these are siblings of the closest node to the end of the range (if any)
    //assumption: nodeAfter doesn't grab anything if the next node to the end of the range is one level up
    const nodesToMove: ModelNode[] = [];
    let nextNode = modelRange.end.nodeAfter();

    while (nextNode) {
      nodesToMove.push(nextNode);
      nextNode = nextNode.getNextSibling(root);
    }

    //grab all nodes inside the range
    //assumption: the only partial nodes that treewalker grabs are the ones that have opening tags in the selection
    //assumption: opening tag nodes are always parents of the last node in range
    const walker = GenTreeWalker.fromRange({
      range: modelRange,
      filter: toFilterSkipFalse((node) => ModelNode.isModelElement(node)),
    });
    const allNodes = [...walker.nodes()];

    //get all nodes that are fully contained in the range
    //ie [<span><text>abc</text>]</span>
    //would grab just the text node
    const confinedNodes: ModelNode[] = [];
    const confinedRanges = modelRange.getMinimumConfinedRanges();
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
          opNode.unwrap(root);
        }
      } else {
        throw new Error('opening tag node is not an element, deletion failed');
      }
    });

    //remove nodes that are fully confined in the selection
    confinedNodes.forEach((node) => {
      if (node.getParent(root)) {
        node.remove(root);
      }
    });

    //merge the nodes we collected before (siblings at the end position) to the start position
    //unless if the start position is a descendant of one of the tags we dont merge into
    const parent = modelRange.start.parent;

    let index;
    const nodeBefore = modelRange.start.nodeBefore();
    const nodeAfter = modelRange.start.nodeAfter();
    if (nodeBefore) {
      index = nodeBefore.getIndex(root)! + 1;
    } else if (nodeAfter) {
      index = nodeAfter.getIndex(root)!;
    } else {
      index = 0;
    }

    let merge;

    merge = !parent
      .findSelfOrAncestors(
        root,
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
      nodesToMove.forEach((node) => node.remove(root));
      parent.insertChildrenAtIndex(index, ...nodesToMove);
    }

    //merge text nodes that end up next to each other
    const after = modelRange.start.nodeAfter();
    const before = modelRange.start.nodeBefore();
    if (before && after) {
      if (ModelNode.isModelText(before) && ModelNode.isModelText(after)) {
        this.mergeTextNodes(root, [before]);
      }
    }

    //not sure i did this correcctly
    const removedOpeningTagNodes = openingTagNodes.filter((node) => {
      return !cantRemoveOpeningTagNodes.includes(node);
    });

    return {
      removedNodes: [...confinedNodes, ...removedOpeningTagNodes],
      mapper: new SimpleRangeMapper([
        buildPositionMappingForInsert(range.start, range.end, 0),
      ]),
    };
  }

  static remove(
    root: ModelElement,
    range: SimpleRange
  ): OperationAlgorithmResponse<{ removedNodes: ModelNode[] }> {
    let newStartNode: ModelNode | null = null;
    let newEndNode: ModelNode | null = null;
    let splitStart = false;
    let splitEnd = false;
    const modelRange = simpleRangeToModelRange(range, root);
    if (modelRange.start.isInsideText()) {
      modelRange.start.split();
      splitStart = true;
    }
    if (modelRange.end.isInsideText()) {
      modelRange.end.split(true);
      splitEnd = true;
    }
    if (splitStart) {
      newStartNode = modelRange.start.nodeAfter();
    }
    if (splitEnd) {
      newEndNode = modelRange.end.nodeBefore();
    }

    const nodesToRemove = [];

    const confinedRanges = modelRange.getMinimumConfinedRanges();
    for (const range of confinedRanges) {
      if (!range.collapsed) {
        const walker = new ModelTreeWalker({ range, descend: false });
        nodesToRemove.push(...walker);
      }
    }

    if (!modelRange.collapsed && newStartNode) {
      newStartNode.remove(root);
    }
    for (const node of nodesToRemove.filter(
      (node) => node !== newStartNode && node !== newEndNode
    )) {
      node.remove(root);
    }
    if (!modelRange.collapsed && newEndNode && !(newStartNode === newEndNode)) {
      newEndNode.remove(root);
    }

    return {
      removedNodes: nodesToRemove,
      mapper: new SimpleRangeMapper([
        buildPositionMappingForInsert(range.start, range.end, 0),
      ]),
    };
  }

  static insert(
    root: ModelElement,
    range: SimpleRange,
    ...nodes: ModelNode[]
  ): OperationAlgorithmResponse<{
    overwrittenNodes: ModelNode[];
    _markCheckNodes: ModelNode[];
  }> {
    let overwrittenNodes: ModelNode[] = [];
    let mapper: SimpleRangeMapper;
    const modelRange = simpleRangeToModelRange(range, root);
    const _markCheckNodes: ModelNode[] = [...nodes];
    const insertSize = nodes.reduce((prev, current) => current.size + prev, 0);
    if (modelRange.collapsed) {
      if (modelRange.start.path.length === 0) {
        modelRange.root.appendChildren(...nodes);
      } else {
        modelRange.start.split();
        const before = modelRange.start.nodeBefore();
        const after = modelRange.start.nodeAfter();
        if (before) {
          _markCheckNodes.push(before);
        }
        if (after) {
          _markCheckNodes.push(after);
        }
        modelRange.start.parent.insertChildrenAtOffset(
          modelRange.start.parentOffset,
          ...nodes
        );
      }
      mapper = new SimpleRangeMapper([
        buildPositionMappingForInsert(range.start, range.end, insertSize),
      ]);
    } else {
      const { removedNodes, mapper: removeMapper } = OperationAlgorithms.remove(
        root,
        range
      );
      overwrittenNodes = removedNodes;
      const rangeAfterRemove = removeMapper.mapRange(range);
      const modelRangeAfterRemove = simpleRangeToModelRange(
        rangeAfterRemove,
        root
      );

      modelRangeAfterRemove.start.parent.insertChildrenAtOffset(
        modelRangeAfterRemove.start.parentOffset,
        ...nodes
      );

      mapper = removeMapper.appendMapper(
        new SimpleRangeMapper([
          buildPositionMappingForInsert(
            rangeAfterRemove.start,
            rangeAfterRemove.end,
            insertSize
          ),
        ])
      );
    }
    const startNode = nodes[0];
    let endNode = nodes[nodes.length - 1];
    if (ModelNode.isModelText(startNode)) {
      const previousSibling = startNode.getPreviousSibling(root);
      if (
        previousSibling &&
        ModelNode.isModelText(previousSibling) &&
        startNode.isMergeable(previousSibling)
      ) {
        previousSibling.content = previousSibling.content + startNode.content;
        startNode.remove(root);
        if (startNode === endNode) {
          endNode = previousSibling;
        }
      }
    }
    if (ModelNode.isModelText(endNode)) {
      const nextSibling = endNode.getNextSibling(root);
      if (
        nextSibling &&
        ModelNode.isModelText(nextSibling) &&
        endNode.isMergeable(nextSibling)
      ) {
        endNode.content = endNode.content + nextSibling.content;
        nextSibling.remove(root);
      }
    }
    return {
      overwrittenNodes,
      _markCheckNodes,
      mapper,
    };
  }

  static move(
    root: ModelElement,
    rangeToMove: SimpleRange,
    targetPosition: SimplePosition
  ): OperationAlgorithmResponse<{
    movedNodes: ModelNode[];
    overwrittenNodes: ModelNode[];
    _markCheckNodes: ModelNode[];
  }> {
    const { removedNodes: nodesToMove, mapper: deletionMapper } =
      OperationAlgorithms.remove(root, rangeToMove);
    const targetRange = { start: targetPosition, end: targetPosition };
    if (nodesToMove.length) {
      const {
        overwrittenNodes,
        _markCheckNodes,
        mapper: insertionMapper,
      } = OperationAlgorithms.insert(root, targetRange, ...nodesToMove);
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
    root: ModelElement,
    position: SimplePosition,
    keepright = false
  ): OperationAlgorithmResponse<{ position: SimplePosition }> {
    const modelPosition = simplePosToModelPos(position, root);
    modelPosition.split(keepright);
    return { position, mapper: new SimpleRangeMapper() };
  }

  static split(
    root: ModelElement,
    position: SimplePosition,
    keepright = false
  ): OperationAlgorithmResponse<{ position: SimplePosition }> {
    OperationAlgorithms.splitText(root, position, keepright);
    const modelPosition = simplePosToModelPos(position, root);
    const parent = modelPosition.parent;
    if (parent === modelPosition.root) {
      return { position, mapper: new SimpleRangeMapper() };
    }
    const grandParent = parent.getParent(root);
    if (!grandParent) {
      return { position, mapper: new SimpleRangeMapper() };
    }

    if (keepright) {
      const left = parent.shallowClone();
      const before = modelPosition.nodeBefore();
      if (before) {
        const leftSideChildren = parent.children.splice(
          0,
          before.getIndex(root)!
        );
        left.appendChildren(...leftSideChildren);
      }
      grandParent.addChild(left, parent.getIndex(root)!);
      return {
        position: modelPosToSimplePos(ModelPosition.fromAfterNode(root, left)),
        mapper: new SimpleRangeMapper([buildSplitMapping(position)]),
      };
    } else {
      const right = parent.shallowClone();
      const after = modelPosition.nodeAfter();
      if (after) {
        const rightSideChildren = parent.children.splice(after.getIndex(root)!);
        right.appendChildren(...rightSideChildren);
      }
      grandParent.addChild(right, parent.getIndex(root)! + 1);
      return {
        position: modelPosToSimplePos(
          ModelPosition.fromBeforeNode(root, right)
        ),
        mapper: new SimpleRangeMapper([buildSplitMapping(position)]),
      };
    }
  }

  static mergeTextNodes(root: ModelElement, nodes: ModelText[]) {
    for (const node of nodes) {
      const sibling = node.getNextSibling(root);
      if (
        sibling &&
        ModelNode.isModelText(sibling) &&
        node.isMergeable(sibling)
      ) {
        sibling.content = node.content + sibling.content;
        node.remove(root);
      }
    }
  }
}

function buildPositionMappingForInsert(
  start: SimplePosition,
  end: SimplePosition,
  insertSize: number
): SimplePositionMapping {
  return function (
    position: SimplePosition,
    bias: LeftOrRight = 'left'
  ): SimplePosition {
    let result;
    const newEnd = start + insertSize;
    if (position < start) {
      result = position;
    } else if (position <= end) {
      if (bias === 'left') {
        result = position;
      } else {
        result = newEnd;
      }
    } else {
      result = newEnd;
    }
    return result;
  };
}

function buildSplitMapping(splitPos: SimplePosition) {
  return function (position: SimplePosition, bias: LeftOrRight = 'left') {
    let result;
    if (position < splitPos) {
      result = position;
    } else if (position === splitPos) {
      if (bias === 'left') {
        result = position;
      } else {
        result = position + 2;
      }
    } else {
      result = position + 2;
    }
    return result;
  };
}
