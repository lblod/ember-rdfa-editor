import EmberObject from '@ember/object';
import { reads } from '@ember/object/computed';
import HandlerResponse from './handler-response';
import { get } from '@ember/object';
import {
  invisibleSpace,
  isEmptyList,
  removeNode,
  isAllWhitespace,
  isLI,
  findPreviousLi
} from '../dom-helpers';
import previousTextNode, { previousVisibleNode} from '../previous-text-node';
import { isRdfaNode } from '../../rdfa/rdfa-rich-node-helpers';
import { warn, debug } from '@ember/debug';
import { A } from '@ember/array';
import { isInLumpNode, getParentLumpNode, getPreviousNonLumpTextNode } from '../lump-node-utils';
import NodeWalker from '@lblod/marawa/node-walker';

/**
 * Backspace Handler, a event handler to handle the generic backspace case
 *
 * @module contenteditable-editor
 * @class BackspaceHandler
 * @constructor
 * @extends EmberObject
 */
export default EmberObject.extend({
  rootNode: reads('rawEditor.rootNode'),
  currentSelection: reads('rawEditor.currentSelection'),
  richNode: reads('rawEditor.richNode'),
  currentNode: reads('rawEditor.currentNode'),

  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {DOMEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(event) {
    return event.type === "keydown"
      && event.key === 'Backspace'
      && this.get('rawEditor.currentSelectionIsACursor')
      && this.doesCurrentNodeBelongsToContentEditable();
  },

  deleteCharacter(textNode, trueRelativePosition) {
    const text = textNode.textContent;
    const slicedText = text.slice(trueRelativePosition - 1 , trueRelativePosition);
    textNode.textContent = text.slice(0, trueRelativePosition - slicedText.length) + text.slice(trueRelativePosition);
    this.rawEditor.updateRichNode();
    this.rawEditor.setCarret(textNode, trueRelativePosition - slicedText.length);
  },

  doesCurrentNodeBelongsToContentEditable() {
    return this.currentNode && this.currentNode.parentNode && this.currentNode.parentNode.isContentEditable;
  },

  /**
   * given richnode and absolute position, matches position within text node
   * @method absoluteToRelativePostion
   * @param {Object} richNode
   * @param {Int} position
   * @return {RichNode}
   * @private
   */
  absoluteToRelativePosition(richNode, position) {
    return Math.max(position -  get(richNode, 'start'), 0);
  },

  /**
   * handle backspace event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent() {
    this.rawEditor.externalDomUpdate('backspace', () => this.backSpace());
    return HandlerResponse.create({ allowPropagation: false });
  },

  /**
   * return to visible text of a node,
   * e.g. removes invisibleSpaces and compacts consecutive spaces to 1 space
   * @method visibleText
   * @param {Node} node
   * @return {String}
   * @public
   */
  visibleText(node) {
    return this.stringToVisibleText(node.textContent);
  },

  /**
   * Removes invisibleSpaces and compacts consecutive spaces to 1 space.
   *
   * The \s match matches a bunch of content, as per
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Character_Classes
   * and we do not want to match all of them.  Currently 160 (&nbsp;
   * A0) is removed from this list.
   *
   * @method stringToVisibleText
   * @param {String} text
   * @return {String}
   * @public
   */
  stringToVisibleText(string) {
    // \s as per JS [ \f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff].

    return string
      .replace(invisibleSpace,'') // TODO: check if invisiblespace is in the list already
      .replace(/[ \f\n\r\t\v\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g,' ');
  },

  /**
   * executes a backspace
   * @method backspace
   * @public
   */
  backSpace() {
    const position = this.currentSelection[0];
    const textNode = this.currentNode;
    const richNode = this.rawEditor.getRichNodeFor(textNode);
    this.mergeSiblingTextNodes(textNode, richNode);
    try {
      let visibleText = this.visibleText(textNode);
      let visibleLength = visibleText.length;
      if (visibleLength > 0 && !isAllWhitespace(textNode)) {
        this.backspaceInNonEmptyNode(richNode, position, visibleLength);
      }
      else {
        this.backspaceInEmptyNode(textNode, visibleLength);
      }
    }
    catch(e) {
      warn(e, { id: 'rdfaeditor.invalidState'});
    }
  },

  backspaceInNonEmptyNode(richNode, position, visibleLength) {
    const textNode = richNode.domNode;
    const originalText = textNode.textContent;
    const relPosition = this.absoluteToRelativePosition(richNode, position);
    const textBeforeCursor = originalText.slice(0, relPosition);
    textNode.textContent = this.stringToVisibleText(originalText);
    /* we need to correct the position, as we've just modified the text content
     * this calculates the delta by comparing the length of the original text before the cursor and the new length
     */
    const posCorrection = textBeforeCursor.length - this.stringToVisibleText(textBeforeCursor).length;
    const trueRelativePosition = relPosition - posCorrection;
    if (trueRelativePosition === 0) {
      // start of non empty node, find valid position before current position
      const previousNode = previousTextNode(textNode, this.rawEditor.rootNode);
      if (previousNode) {
        if (isInLumpNode(previousNode)) {
          this.handleLumpRemoval(previousNode);
        }
        else {
          // move cursor to previous node
          this.rawEditor.updateRichNode();
          this.rawEditor.setCarret(previousNode, previousNode.length);
          if (isLI(textNode.parentNode) && richNode.start === richNode.parent.start) {
            // starting position was at the start of an li and we can merge them
            this.removeLI(textNode.parentNode);
            this.rawEditor.updateRichNode();
          }
          else {
            this.backSpace();
          }
        }
      }
      else {
        debug('no previousnode, not doing anything');
      }
    }
    else {
      // not empty and we're not at the start, delete character before the carret
      this.deleteCharacter(textNode, trueRelativePosition);
      if (this.shouldHighlightParentNode(textNode.parentNode, visibleLength)) {
        const removeType = visibleLength > 1 ? 'almost-complete' : 'complete';
        textNode.parentNode.setAttribute('data-flagged-remove', removeType);
      }
    }
  },

  backspaceInEmptyNode(textNode) {
    let shouldContinue = true;
    while (shouldContinue) {
      if (textNode.parentNode.getAttribute('data-flagged-remove') != "complete" && this.shouldHighlightParentNode(textNode.parentNode, 0)) {
        // if the current node is an empty rdfa node, flag it first and don't delete it yet
        textNode.parentNode.setAttribute('data-flagged-remove', 'complete');
        shouldContinue = false;
      }
      else {
        // find valid position before current position
        // let previousNode = previousVisibleNode(textNode, this.rawEditor.rootNode);
        let previousNodeSpec = previousVisibleNode(textNode, this.rawEditor.rootNode);
        const previousNode = previousNodeSpec.node;

        if (previousNodeSpec.jumpedVisibleNode) {
          this.removeNodesFromTo(textNode, previousNode);
          shouldContinue = false;
        }
        else if (previousNode) {
          if (isInLumpNode(previousNode)) {
            this.handleLumpRemoval(previousNode);
            shouldContinue = false;
          }
          else {
            this.removeNodesFromTo(textNode, previousNode);
            this.rawEditor.updateRichNode();
            textNode = previousNode;
            shouldContinue = this.visibleText(textNode).length == 0 || isAllWhitespace(textNode);
            if (!shouldContinue) {
              this.rawEditor.setCarret(textNode, textNode.length);
            }
          }
        }
        else {
          debug('no previousnode, not doing anything');
          shouldContinue = false;
        }
      }
    }
  },


  previousNode(node) {
    /* backwards walk of dom tree */
    var previousNode;
    if (node.previousSibling) {
      previousNode = node.previousSibling;
      if (previousNode.lastChild)
        previousNode = previousNode.lastChild;
    }
    else if(node.parentNode) {
      previousNode = node.parentNode;
    }
    else {
      throw "node does not have a parent node, not part of editor";
    }
    return previousNode;
  },

  removeNodesFromTo(nodeAfter, nodeBefore, nodes = A()) {
    var previousNode = this.previousNode(nodeAfter);
    if (previousNode === nodeBefore) {
      nodes.pushObject(nodeAfter);
      for (const node of nodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          removeNode(node);
        }
        else if (isLI(node)) {
          this.removeLI(node);
        }
        else if (node.children && node.children.length === 0 || isEmptyList(node)) {
          removeNode(node);
        }
        else {
          // still has content, not removing
        }
      }
    }
    else if (previousNode === this.rawEditor.rootNode) {
      warn('no path between nodes exists', { id: 'rdfaeditor.invalidState'});
    }
    else {
      nodes.pushObject(nodeAfter);
      this.removeNodesFromTo(previousNode, nodeBefore, nodes);
    }
  },

  /**
   * handles node removal for list items
   * list items can also be removed when not empty yet, most online editors seem to move content to a previous or parent node
   * so that's what we do here
   */
  removeLI(listitem) {
    const previousLI=findPreviousLi(listitem);
    const list = listitem.parentNode;
    const parent = list.parentNode ? list.parentNode : null;
    if (previousLI) {
      // move contents of node to previousLI and remove node
      while(listitem.firstChild){
        previousLI.append(listitem.firstChild); // moves the dom node
      }
      listitem.remove();
    }
    else if(parent) {
      // move contents to parent LI and remove node
      while(listitem.firstChild) {
        parent.append(listitem.firstChild); // moves the dom node
      }
      listitem.remove();
    }
    else {
      // no parent, do nothing for now
    }
  },

  handleLumpRemoval(node) {
    // TODO: This implementation has some issues in that the block may remains highlighted if a user decides not to delete it.
    // a cleaner way to handle this (which was tried first) would be to first select the entire block
    // at which point a second selection backspace would delete the entire lump node.
    // if the user then repositions the cursor the selection would dissapear and he/she can continue as is.
    // however currently the editor does not provide clean interfaces to select a block and it became hackisch very quickly.
    const nodeToDeleteAsBlock = getParentLumpNode(node, this.rawEditor.rootNode);
    if (nodeToDeleteAsBlock.getAttribute('data-flagged-remove') == "complete") {
      // if the lump node was already flagged, remove it
      const previousNode = getPreviousNonLumpTextNode(nodeToDeleteAsBlock, this.rawEditor.rootNode);
      this.removeNodesFromTo(previousNode, nodeToDeleteAsBlock);
      nodeToDeleteAsBlock.remove();
      this.rawEditor.updateRichNode();
      this.rawEditor.setCarret(previousNode, previousNode.length);
    }
    else {
      // if the lump node wasn't flagged yet, flag it first
      nodeToDeleteAsBlock.setAttribute('data-flagged-remove', 'complete');
    }
  },

  shouldHighlightParentNode(parentNode, visibleLength) {
    let nodeWalker = new NodeWalker();
    return visibleLength < 5 && parentNode.childNodes.length == 1 && isRdfaNode(nodeWalker.processDomNode(parentNode));
  },
  mergeSiblingTextNodes(textNode, richNode) {
    while (textNode.previousSibling && textNode.previousSibling.nodeType === Node.TEXT_NODE) {
      const previousDOMSibling = textNode.previousSibling;
      const indexOfRichNode = richNode.parent.children.indexOf(richNode);
      const previousRichSibling = richNode.parent.children[indexOfRichNode-1];
      textNode.textContent = `${previousDOMSibling.textContent}${textNode.textContent}`;
      richNode.start = previousRichSibling.start;
      richNode.parent.children.splice(indexOfRichNode - 1, 1);
      previousDOMSibling.remove();
    }
    while (textNode.nextSibling && textNode.nextSibling.nodeType === Node.TEXT_NODE) {
      const nextDOMSibling = textNode.nextSibling;
      const indexOfRichNode = richNode.parent.children.indexOf(richNode);
      const nextRichSibling = richNode.parent.children[indexOfRichNode+1];
      textNode.textContent = `${textNode.textContent}${nextDOMSibling.textContent}`;
      richNode.end = nextRichSibling.end;
      richNode.parent.children.splice(indexOfRichNode + 1 , 1);
      nextDOMSibling.remove();
    }
  }
});
