import { isInLumpNode, getNextNonLumpTextNode, getPreviousNonLumpTextNode } from '../lump-node-utils';
import { RawEditor } from '@lblod/ember-rdfa-editor/editor/raw-editor';

interface SelectionNode {
  domNode: Node;
  absolutePosition: number;
  relativePosition: number;
}
interface EditorNodeSelection {
  startNode: SelectionNode;
  endNode: SelectionNode;
}
function isSelectionNodeEqual(
  firstNode: SelectionNode,
  secondNode: SelectionNode
) {
  return (
    firstNode.absolutePosition === secondNode.absolutePosition &&
    firstNode.relativePosition === secondNode.relativePosition &&
    firstNode.domNode.isSameNode(secondNode.domNode)
  );
}
function isSelectionEqual(
  oldSelection: EditorNodeSelection,
  newSelection: EditorNodeSelection
) {
  return (
    isSelectionNodeEqual(oldSelection.startNode, newSelection.startNode) &&
    isSelectionNodeEqual(oldSelection.endNode, newSelection.endNode)
  );
}

export default class LumpNodeMovementObserver {
  handleMovement(editor: RawEditor, oldSelection?: EditorNodeSelection, newSelection?: EditorNodeSelection) {
    if(!newSelection) return;
    if (oldSelection && !isSelectionEqual(oldSelection, newSelection)) {
      const lumpNodesMarkedForRemoval = document.querySelectorAll(
        "[data-flagged-remove]"
      );
      for (const node of lumpNodesMarkedForRemoval) {
        node.removeAttribute("data-flagged-remove");
      }
    }
    if (isInLumpNode(newSelection.startNode.domNode, editor.rootNode)) {
      let newNode;
      let relativePosition;
      if (oldSelection && oldSelection.startNode.absolutePosition > newSelection.startNode.absolutePosition) {
        // seems a backward movement, set cursor before lump node
        newNode = getPreviousNonLumpTextNode(newSelection.startNode.domNode, editor.rootNode);
        if(!newNode) {
          throw new Error("no previous non-lump textnode found");
        }
        relativePosition = newNode.length;
      }
      else {
        // seems a forward movement, set cursor after lump node
        newNode = getNextNonLumpTextNode(newSelection.startNode.domNode, editor.rootNode);
        relativePosition = 0;
      }
      editor.updateRichNode();
        if(!newNode) {
          throw new Error("no previous non-lump textnode found");
        }
      editor.setCaret(newNode, relativePosition);
    }
    else if (isInLumpNode(newSelection.endNode.domNode, editor.rootNode)) {
      // startNode != endNode, a selection ending in a lumpNode, for now
      // for now just reset to start of the selection
      editor.setCaret(newSelection.startNode.domNode, newSelection.startNode.relativePosition);
    }
  }
}
