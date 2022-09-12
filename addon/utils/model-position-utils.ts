import ModelNode from '../model/nodes/model-node';
import ModelPosition from '../model/model-position';

export default class ModelPositionUtils {
  static isValid(position: ModelPosition) {
    let i = 0;
    let current: ModelNode | null = position.root;
    while (ModelNode.isModelElement(current) && i < position.path.length - 1) {
      current = current.childAtOffset(position.path[i], true);
      i++;
    }
    if (
      !current ||
      (i > 0 && i !== position.path.length - 1) ||
      position.path[position.path.length - 1] >= current.length
    ) {
      return false;
    }
    return true;
  }
}
