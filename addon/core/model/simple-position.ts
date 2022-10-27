import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { SimplePositionOutOfRangeError } from '@lblod/ember-rdfa-editor/utils/errors';
import ArrayUtils from '@lblod/ember-rdfa-editor/utils/array-utils';
import unwrap from '@lblod/ember-rdfa-editor/utils/unwrap';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';

export type SimplePosition = number;

export function simplePosToModelPos(
  simplePos: SimplePosition,
  root: ModelElement
): ModelPosition {
  if (simplePos < 0) {
    throw new SimplePositionOutOfRangeError(simplePos);
  }
  if (simplePos === 0) {
    return ModelPosition.fromInNode(root, root, 0);
  }
  let cur: ModelNode | null = root.firstChild;
  let count = 0;
  while (cur) {
    const curSize = cur.size;
    if (count + curSize < simplePos) {
      count += curSize;
      cur = cur.getNextSibling(root);
    } else if (count + curSize === simplePos) {
      return ModelPosition.fromAfterNode(root, cur);
    } else {
      if (ModelNode.isModelElement(cur) && !cur.isLeaf) {
        count += 1;
        if (cur.firstChild) {
          cur = cur.firstChild;
        } else {
          return ModelPosition.fromInNode(root, cur, simplePos - count);
        }
      } else {
        if (ModelNode.isModelText(cur)) {
          return ModelPosition.fromInNode(root, cur, simplePos - count);
        } else {
          return ModelPosition.fromBeforeNode(root, cur);
        }
      }
    }
  }

  throw new SimplePositionOutOfRangeError(simplePos);
}

export function modelPosToSimplePos(modelPos: ModelPosition): SimplePosition {
  const { root, path } = modelPos;
  if (path.length === 0) {
    return 0;
  }
  let cur: ModelNode | null = root;
  let counter = -1;
  for (const offset of path.slice(0, path.length - 1)) {
    if (ModelNode.isModelElement(cur)) {
      cur = cur.childAtOffset(offset, true);
      counter += 1;
      if (cur) {
        counter += countPreviousSiblings(root, cur);
      }
    }
  }
  if (cur && ModelNode.isModelElement(cur)) {
    const lastOffset = unwrap(ArrayUtils.lastItem(path));
    const last = cur.childAtOffset(lastOffset, true);
    counter += 1;
    if (last) {
      counter += countPreviousSiblings(root, last);
      if (ModelNode.isModelElement(last)) {
        if (lastOffset === cur.getMaxOffset()) {
          counter += last.size;
        }
      } else {
        counter += lastOffset - last.getOffset(root);
      }
    }
  }
  return counter;
}

function countPreviousSiblings(root: ModelElement, node: ModelNode): number {
  let counter = 0;
  let sib = node.getPreviousSibling(root);
  while (sib) {
    counter += sib.size;
    sib = sib.getPreviousSibling(root);
  }
  return counter;
}
