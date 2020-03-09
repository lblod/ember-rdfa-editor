import { isInLumpNode, getNextNonLumpTextNode, getPreviousNonLumpTextNode, animateLumpNode, getParentLumpNode } from '../lump-node-utils';

export default class LumpNodeMovementObserver {
  handleMovement(document, oldSelection, newSelection) {
    if (isInLumpNode(newSelection.startNode.domNode, document.rootNode)) {
      let newNode;
      let relativePosition;
      if (oldSelection && oldSelection.startNode.absolutePosition >= newSelection.startNode.absolutePosition) {
        // seems a backward movement, set cursor before lump node
        newNode = getPreviousNonLumpTextNode(newSelection.startNode.domNode, document.rootNode);
        relativePosition = newNode.length;
      }
      else {
        // seems a forward movement, set cursor after lump node
        newNode = getNextNonLumpTextNode(newSelection.startNode.domNode, document.rootNode);
        relativePosition = 0;
      }
      animateLumpNode(getParentLumpNode(newSelection.startNode.domNode));
      document.updateRichNode();
      document.setCarret(newNode, relativePosition);
    }
  }
}
