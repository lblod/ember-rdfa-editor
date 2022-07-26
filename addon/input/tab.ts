import Controller from '../model/controller';
import ModelElement from '../model/model-element';
import ModelNode from '../model/model-node';
import ModelPosition from '../model/model-position';
import ModelRange from '../model/model-range';
import GenTreeWalker from '../model/util/gen-tree-walker';
import { toFilterSkipFalse } from '../model/util/model-tree-walker';
import { Direction } from '../model/util/types';

export default function handleTab(
  controller: Controller,
  event: KeyboardEvent
) {
  event.preventDefault();
  const selection = controller.selection;
  const selRange = selection.lastRange!;
  let pos = selRange.start;
  if (pos.isInsideText()) {
    // SAFETY: pos inside text guarantees nodeAfter to be non-null
    pos = ModelPosition.fromAfterNode(pos.nodeAfter()!);
  }
  const direction = event.shiftKey ? Direction.BACKWARDS : Direction.FORWARDS;
  let filter;

  if (controller.getConfig('showRdfaBlocks')) {
    filter = toFilterSkipFalse(
      (node: ModelNode) =>
        ModelNode.isModelText(node) ||
        (ModelNode.isModelElement(node) && !node.getRdfaAttributes().isEmpty)
    );
  } else {
    filter = toFilterSkipFalse((node: ModelNode) =>
      ModelNode.isModelText(node)
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
}

function posInside(element: ModelElement, direction: Direction): ModelPosition {
  if (direction === Direction.BACKWARDS) {
    return ModelPosition.fromInElement(element, element.getMaxOffset());
  } else {
    return ModelPosition.fromInElement(element, 0);
  }
}
