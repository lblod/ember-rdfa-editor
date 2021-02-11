import getRichNodeMatchingDomNode from '../get-rich-node-matching-dom-node';
import {
  tagName,
  isDisplayedAsBlock,
  invisibleSpace,
  insertNodeBAfterNodeA,
  insertTextNodeWithSpace
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import HandlerResponse from './handler-response';
import { debug } from '@ember/debug';
import { isBlank } from '@ember/utils';

/**
 * Enter Handler, a event handler to handle the generic enter case
 * @module contenteditable-editor
 * @class EnterHandler
 * @constructor
 */
export default class EnterHandler {
  constructor({rawEditor}) {
    this.rawEditor = rawEditor;
  }

  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {DOMEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(event){
    return this.rawEditor.currentNode && event.type === "keydown" && event.key === "Enter" && this.rawEditor.currentSelectionIsACursor;
  }

  /**
   * handle enter event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent(event) {
    let currentNode = this.rawEditor.currentNode;
    let node = getRichNodeMatchingDomNode(currentNode, this.rawEditor.richNode);
    let currentPosition = this.rawEditor.currentSelection[0];
    let nodeForEnter = this.relevantNodeForEnter(node);
    if (event.shiftKey && currentNode && currentNode.nodeType === Node.TEXT_NODE) {
      debug('shift enter');
      this.rawEditor.externalDomUpdate(
        'inserting enter in text',
        () => this.insertBr());
      return HandlerResponse.create({allowPropagation: false});
    }
    else if (tagName(nodeForEnter.domNode) === "li") {
      // for shift enter fall back to default behaviour
      debug('enter in li');
      this.rawEditor.externalDomUpdate(
        'inserting enter in li',
        () => this.insertEnterInLi(node, nodeForEnter, currentPosition, currentNode)
      );
      return HandlerResponse.create({allowPropagation: false});
    }
    else if (tagName(nodeForEnter.domNode) === "p") {
      debug('enter in p');
      this.rawEditor.externalDomUpdate(
        'splitting p',
        () => this.insertNewParagraph(node, nodeForEnter, currentPosition, currentNode) );
      return HandlerResponse.create({allowPropagation: false});
    }
    else if (currentNode && currentNode.nodeType === Node.TEXT_NODE) {
      debug('fallback br in text node');
      this.rawEditor.externalDomUpdate(
        'inserting enter in text',
        () => this.insertBr());
      return HandlerResponse.create({allowPropagation: false});
    }
    else {
      debug('-------------- not handling this enter yet------------------');
      return HandlerResponse.create({allowPropagation: true, allowBrowserDefault: true});
    }
  }

  insertBr() {
    debug('placing br');
    let currentNode = this.rawEditor.currentNode;
    let richNode = getRichNodeMatchingDomNode(currentNode, this.rawEditor.richNode);
    let currentPosition = this.rawEditor.currentSelection[0];

    let splitAt = currentPosition - richNode.start;
    let above = document.createTextNode(currentNode.textContent.slice(0,splitAt));
    let content = currentNode.textContent.slice(splitAt);
    if (isBlank(content))
      content = invisibleSpace;
    let below = document.createTextNode(content);
    let br = document.createElement('br');

    currentNode.parentNode.insertBefore(above, currentNode);
    currentNode.parentNode.insertBefore(br, currentNode);
    currentNode.parentNode.insertBefore(below, currentNode);
    currentNode.parentNode.removeChild(currentNode);

    this.rawEditor.updateRichNode();
    this.rawEditor.setCaret(below, 0);
  }

  /**
   * @method relevantNodeForEnter
   * @param {RichNode} richnode
   * @private
   */
  relevantNodeForEnter(node) {
    while(! isDisplayedAsBlock(node.domNode) && ! this.rawEditor.rootNode.isSameNode(node.domNode)) {
      node = node.parent;
    }
    return node;
  }

  /**
   * @method lisIsEmpty
   * @param {RichNode} node
   * @private
   */
  liIsEmpty(node) {
    let re = new RegExp(invisibleSpace,"g");
    return isBlank(node.domNode.textContent.replace(re, ''));
  }

  /**
   * @method insertEnterInLi
   * @param {RichNode} node
   * @param {RichNode} nodeForEnter
   * @param {number} currentPosition
   * @param {DOMNode} currentNode
   * @private
   */
  insertEnterInLi(node, nodeForEnter, currentPosition/*, currentNode*/) {
    // it's an li
      let ulOrOl = nodeForEnter.parent;
      let domNode = ulOrOl.domNode;
      let liDomNode = nodeForEnter.domNode;
      let textNode;
      const newElement = document.createElement('li');
      textNode = insertTextNodeWithSpace(newElement);
      if (! this.liIsEmpty(nodeForEnter) && (currentPosition === nodeForEnter.start)) {
        // insert li before li
        domNode.insertBefore(newElement,liDomNode);
      }
      else {
        // insert li after li
        insertNodeBAfterNodeA(domNode, liDomNode, newElement);
      }
      if (node.type ==='text' && nodeForEnter.children.includes(node)) {
        // the text node is a direct child of the li, we can split this
        const index = currentPosition - node.start;
        const text = node.domNode.textContent;
        if (currentPosition >= node.start && currentPosition <= node.end && currentPosition !== nodeForEnter.start) {
          // cursor not at start of the li, so just move everything after the cursor to the next node
          // if it is at the start an li was already inserted before it and we don't have to do anything
          node.domNode.textContent = text.slice(0,index);
          textNode.textContent = text.slice(index);
          while (node.domNode.nextSibling) {
            textNode.parentNode.append(node.domNode.nextSibling);
          }
        }
      }
      this.rawEditor.updateRichNode();
      this.rawEditor.setCaret(textNode, 0);

  }

  /**
   * @method insertEnterInP
   * @param {RichNode} node
   * @param {RichNode} nodeForEnter First block node above our cursor
   * @param {number} currentPosition
   * @param {DOMNode} currentNode Node where the cursor is currently at
   * @private
   */
  insertNewParagraph(richNode, nodeForEnter, currentPosition, currentNode) {
    if (currentNode.nodeType !== Node.TEXT_NODE) {
      debug('-------------- not handling this enter yet (p)------------------');
      return HandlerResponse.create({allowPropagation: true, allowBrowserDefault: true});
    }

    // it's a text node
    this.rawEditor.externalDomUpdate(
      'inserting enter in paragraph',
      () => {
        let splitAt = currentPosition - richNode.start;
        let above = document.createTextNode(currentNode.textContent.slice(0,splitAt));
        let content = currentNode.textContent.slice(splitAt);
        if (isBlank(content))
          content = invisibleSpace;
        let newTextNode = document.createTextNode(content);

        currentNode.parentNode.insertBefore(above, currentNode); // insert new text node
        currentNode.parentNode.removeChild(currentNode); // remove old text node

        // Insert the new paragraph right after the current paragraph
        // TODO: this isn't correct for a p with multiple elements,
        //e.g <p>PREFIX_TEXT_NODE|cursor|POSTFIX_TEXT_NODE<span>TEXT_NODE</span></p> will not move the span...
        const newParagraph = document.createElement( "p" );
        newParagraph.appendChild( newTextNode );
        nodeForEnter.domNode.insertAdjacentElement('afterend', newParagraph);
        this.rawEditor.updateRichNode();
        this.rawEditor.setCaret(newTextNode, 0);
      });

    return undefined;
  }

}
