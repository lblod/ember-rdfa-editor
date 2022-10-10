import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { SimplePositionOutOfRangeError } from '@lblod/ember-rdfa-editor/utils/errors';

export type SimplePosition = number;

export function simplePosToModelPos(
  simplePos: SimplePosition,
  root: ModelNode
): ModelPosition {
  if (simplePos < 0) {
    throw new SimplePositionOutOfRangeError(simplePos);
  }
  if (simplePos === 0) {
    return ModelPosition.fromInNode(root, 0);
  }
  let cur: ModelNode | null = root.firstChild;
  let count = 0;
  while (cur) {
    const curSize = cur.size;
    if (count + curSize < simplePos) {
      count += curSize;
      cur = cur.nextSibling;
    } else if (count + curSize === simplePos) {
      return ModelPosition.fromAfterNode(cur);
    } else {
      if (ModelNode.isModelElement(cur) && !cur.isLeaf) {
        count += 1;
        if (cur.firstChild) {
          cur = cur.firstChild;
        } else {
          return ModelPosition.fromInNode(cur, simplePos - count);
        }
      } else {
        if (ModelNode.isModelText(cur)) {
          return ModelPosition.fromInNode(cur, simplePos - count);
        } else {
          return ModelPosition.fromBeforeNode(cur);
        }
      }
    }
  }

  throw new SimplePositionOutOfRangeError(simplePos);
}

export function modelPosToSimplePos(modelPos: ModelPosition): SimplePosition {
  return 0;
}
