import { isInLumpNode, getNextNonLumpTextNode, animateLumpNode, getParentLumpNode } from '../lump-node-utils';
export default class LumpNodeMovementObserver {
  handleMovement(document, oldSelection, newSelection) {
    if (isInLumpNode(newSelection.startNode) && !isInLumpNode(oldSelection.startNode)) {
      document.setCurrentPosition(oldSelection.startNode.position);
      animateLumpNode(getParentLumpNode(newSelection.startNode));
    }
    else if (isInLumpNode(newSelection.startNode) && isInLumpNode(oldSelection.startNode)) {
      // how could this happen?
      const newNode = getNextNonLumpTextNode(newSelection.startNode, document.rootNode);
      document.setCarret(newNode, 0);
    }
  }
}
