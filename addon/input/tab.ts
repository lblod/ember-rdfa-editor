import Controller from '../core/controllers/controller';
import ModelElement from '../model/nodes/model-element';
import ModelNode from '../model/nodes/model-node';
import ModelPosition from '../model/model-position';
import ModelRange from '../model/model-range';
import GenTreeWalker from '../utils/gen-tree-walker';
import ModelNodeUtils from '../utils/model-node-utils';
import { toFilterSkipFalse } from '../utils/model-tree-walker';
import { Direction } from '../utils/types';

export default function handleTab(dir: 1 | -1) {
  return function (controller: Controller, event: KeyboardEvent) {
    event.preventDefault();
    const selection = controller.selection;
    const selRange = selection.lastRange!;
    let pos = selRange.start;
    if (pos.isInsideText()) {
      // SAFETY: pos inside text guarantees nodeAfter to be non-null
      pos = ModelPosition.fromAfterNode(pos.nodeAfter()!);
    }
    const direction = dir < 0 ? Direction.BACKWARDS : Direction.FORWARDS;
    let filter;

    if (controller.getConfig('showRdfaBlocks')) {
      filter = toFilterSkipFalse(
        (node: ModelNode) =>
          (ModelNode.isModelText(node) ||
            (ModelNode.isModelElement(node) &&
              !node.getRdfaAttributes().isEmpty)) &&
          !ModelNodeUtils.parentIsLumpNode(node)
      );
    } else {
      filter = toFilterSkipFalse(
        (node: ModelNode) =>
          ModelNode.isModelText(node) && !ModelNodeUtils.parentIsLumpNode(node)
      );
    }

    const walker = GenTreeWalker.fromPosition({
      position: pos,
      reverse: event.shiftKey,
      filter,
    });
    const nodes = walker.nodes();
    let resultPos;
    const nextNode = nodes.next().value;
    if (ModelNode.isModelElement(nextNode)) {
      resultPos = ModelPosition.fromInNode(nextNode, 0);
    } else if (nextNode) {
      resultPos = ModelPosition.fromBeforeNode(nextNode);
    }
    if (resultPos && resultPos.sameAs(pos)) {
      const nextNode = nodes.next().value;
      if (ModelNode.isModelElement(nextNode)) {
        resultPos = posInside(nextNode, direction);
      } else if (nextNode) {
        resultPos = ModelPosition.fromBeforeNode(nextNode);
      }
    }
    if (resultPos) {
      const newRange = new ModelRange(resultPos, resultPos);
      controller.perform((tr) => {
        tr.selectRange(newRange);
      });
    }
  };
}

function posInside(element: ModelElement, direction: Direction): ModelPosition {
  if (direction === Direction.BACKWARDS) {
    return ModelPosition.fromInElement(element, element.getMaxOffset());
  } else {
    return ModelPosition.fromInElement(element, 0);
  }
}
