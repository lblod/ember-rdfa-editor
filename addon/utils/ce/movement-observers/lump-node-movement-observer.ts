import { isInLumpNode, getParentLumpNode } from '../lump-node-utils';
import { ensureValidTextNodeForCaret } from '@lblod/ember-rdfa-editor/editor/utils';
import PernetRawEditor, {InternalSelection} from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import {isElement, isTextNode} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

export default class LumpNodeMovementObserver {
  handleMovement(editor: PernetRawEditor, oldSelection: InternalSelection, newSelection: InternalSelection): void {
    if (oldSelection) {
      // Backspace may have highlighted the lump node and user is no longer trying to delete it, so remove the highlight.
      // TODO: This doesn't work as expected and needs revision.
      const previousNode = oldSelection.startNode.domNode;

      if (previousNode.parentNode
        && oldSelection.startNode.absolutePosition !== newSelection.startNode.absolutePosition) {
        // Node is still part of the dom tree.
        const nodeBeforeOldSelection = oldSelection.startNode.domNode.previousSibling;
        if (nodeBeforeOldSelection && isInLumpNode(nodeBeforeOldSelection, editor.rootNode)) {
          const lumpNode = getParentLumpNode(nodeBeforeOldSelection, editor.rootNode);

          if (lumpNode && isElement(lumpNode) && lumpNode.hasAttribute('data-flagged-remove')) {
            lumpNode.removeAttribute('data-flagged-remove');
          }
        }
      }
    }

    if (isInLumpNode(newSelection.startNode.domNode, editor.rootNode)) {
      if (oldSelection && oldSelection.startNode.absolutePosition > newSelection.startNode.absolutePosition) {
        // Seems a backward movement, set cursor before lump node.
        jumpOverLumpNodeBackwards(newSelection.startNode.domNode, editor.rootNode, editor);
      } else {
        // Seems a forward movement, set cursor after lump node.
        jumpOverLumpNode(newSelection.startNode.domNode, editor.rootNode, editor);
      }
    } else if (isInLumpNode(newSelection.endNode.domNode, editor.rootNode)) {
      // startNode !== endNode, a selection ending in a lumpNode.
      // For now just reset to start of the selection.
      editor.setCaret(newSelection.startNode.domNode, newSelection.startNode.relativePosition);
    }
  }
}

/**********************************************************************************************************
 DISCLAIMER: this code is copy-pasta from a utils/plugins/lump-node/backspace-plugin.ts and will be revised.
 It is meant to fix a bug where you could still click into a lump node in some cases.
 Groundwork and collective thinking are need to deal with clicks and selection changes (and arrows etc.).
 It will inject textNode if your previous or next sibling is an element. Not super elegant. Better than before.
***********************************************************************************************************/
function jumpOverLumpNode(node: Node, rootNode: HTMLElement, editor: PernetRawEditor): void {
  const element = getParentLumpNode(node, rootNode);
  if (!element) {
    return;
  }

  let nextNode: Text;
  if (!element.nextSibling) {
    nextNode = document.createTextNode('');
    element.after(nextNode);
  }

  if (element.nextSibling && isTextNode(element.nextSibling)) {
    nextNode = element.nextSibling;
  } else {
    nextNode = document.createTextNode('');
    element.after(nextNode);
  }

  nextNode = ensureValidTextNodeForCaret(nextNode); //TODO: move this in set.caret or other uniform API somehow
  editor.updateRichNode();
  editor.setCaret(nextNode, 0);
}

function jumpOverLumpNodeBackwards(node: Node, rootNode: HTMLElement, editor: PernetRawEditor) {
  const element = getParentLumpNode(node, rootNode);
  if (!element) {
    return;
  }

  let textNode: Text;
  if (element.previousSibling && isTextNode(element.previousSibling)) {
    textNode = element.previousSibling;
  } else {
    textNode = document.createTextNode('');
    element.before(textNode);
  }

  textNode = ensureValidTextNodeForCaret(textNode); //TODO: move this in set.caret or other uniform API somehow
  editor.updateRichNode();
  editor.setCaret(textNode, textNode.length);
}
