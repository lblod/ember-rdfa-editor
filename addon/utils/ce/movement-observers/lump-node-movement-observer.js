import { isInLumpNode, getParentLumpNode } from '../lump-node-utils';
import { moveCaret, ensureValidTextNodeForCaret } from '@lblod/ember-rdfa-editor/editor/utils';

export default class LumpNodeMovementObserver {
  handleMovement(editor, oldSelection, newSelection) {
    if (oldSelection) {
      // backspace may have highlighted the lump node and user is no longer trying to delete it.
      // so remove the highlight
      //TODO: this doesn't work as expected, and needs revision
      const previousNode = oldSelection.startNode.domNode;
      if (previousNode.parentNode && oldSelection.startNode.absolutePosition !== newSelection.startNode.absolutePosition) {
        // node is still part of the domtree
        const nodeBeforeOldSelection = oldSelection.startNode.domNode.previousSibling;
        if (nodeBeforeOldSelection && isInLumpNode(nodeBeforeOldSelection, editor.rootNode)) {
          const lumpNode = getParentLumpNode(nodeBeforeOldSelection, editor.rootNode);
          if (lumpNode.hasAttribute('data-flagged-remove')) {
            lumpNode.removeAttribute('data-flagged-remove');
          }
        }
      }
    }
    if (isInLumpNode(newSelection.startNode.domNode, editor.rootNode)) {
      if (oldSelection && oldSelection.startNode.absolutePosition > newSelection.startNode.absolutePosition) {
        // seems a backward movement, set cursor before lump node
        jumpOverLumpNodeBackwards(newSelection.startNode.domNode, editor.rootNode, editor);
      }
      else {
        // seems a forward movement, set cursor after lump node
        jumpOverLumpNode(newSelection.startNode.domNode, editor.rootNode, editor);
      }
    }
    else if (isInLumpNode(newSelection.endNode.domNode, editor.rootNode)) {
      // startNode != endNode, a selection ending in a lumpNode, for now
      // for now just reset to start of the selection
      editor.setCaret(newSelection.startNode.domNode, newSelection.startNode.relativePosition);
    }
  }
}

/**********************************************************************************************************
 DISCLAIMER: this code is copypasta from a utils/plugins/lump-node/backspace-plugin.ts and will be revised.
 It is meant to fix a bug where you could still click into a lump node in some cases.
 Groundwork and collective thinking are need to deal with clicks and selecion changes (and arrows etc)
 It will inject textNode if your previous or next sibling is an element. Not super elegant. Better than before.
***********************************************************************************************************/
function jumpOverLumpNode(node, rootNode, editor) {
  const element = getParentLumpNode(node, rootNode);
  let nextNode;
  if(!element.nextSibling) {
    nextNode = document.createTextNode('');
    element.after(nextNode);
  }
  if(element.nextSibling && element.nextSibling.nodeType == Node.TEXT_NODE){
    nextNode = element.nextSibling;
  }
  else {
    nextNode = document.createTextNode('');
    element.after(nextNode);
  }
  nextNode = ensureValidTextNodeForCaret(nextNode); //TODO: move this in set.caret or other uniform API somehow
  editor.updateRichNode();
  editor.setCaret(nextNode, 0);
}

function jumpOverLumpNodeBackwards(node, rootNode, editor) {
  const element = getParentLumpNode(node, rootNode);
  let textNode;
  if(element.previousSibling && element.previousSibling.nodeType == Node.TEXT_NODE){
    textNode = element.previousSibling;
  }
  else {
    textNode = document.createTextNode('');
    element.before(textNode);
  }
  textNode = ensureValidTextNodeForCaret(textNode); //TODO: move this in set.caret or other uniform API somehow
  editor.updateRichNode();
  editor.setCaret(textNode, textNode.length);
}
