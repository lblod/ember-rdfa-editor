import { sliceTextIntoTextNode } from '../dom-helpers';
import HandlerResponse from './handler-response';
import { warn } from '@ember/debug';

const supportedInputCharacters = /[a-zA-Z0-9.,!@#$%^&*={};'"+-?_()/\\ ]/;
const NON_BREAKING_SPACE = '\u00A0';

/**
 * Text Input Handler, a event handler to handle text input
 *
 * @module contenteditable-editor
 * @class TextInputHandler
 * @constructor
 */
export default class TextInputHandler {
  rawEditor;
  forceParagraph;
  constructor({rawEditor, forceParagraph = false}) {
    this.rawEditor = rawEditor;
    this.forceParagraph = forceParagraph;
  }
  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {DOMEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(event) {
    if (event.type !== "keydown")
      return false;
    let inp = event.key;
    return ( this.rawEditor.get('currentSelectionIsACursor') || this.aSelectionWeUnderstand() ) &&
      inp.length === 1 && ! event.ctrlKey && !event.altKey && supportedInputCharacters.test(inp);
  }


  /**
   * handle the event
   * @method handleEvent
   * @param {DOMEvent} event
   * @return {HandlerResponse} response
   */
  handleEvent(event) {
    let input = event.key;
    const range = window.getSelection().getRangeAt(0);
    if (range.collapsed) {
      const position = this.rawEditor.currentPosition;
      this.insertText(input, position);
      this.rawEditor.setCurrentPosition(position + input.length);
    }
    else {
      // currently we only support selections inside a text block that start and end in the same text block
      // this is enforced in the isHandlerFor block.
      // TODO: should typing over selections move to a separate handler?
      const rawEditor = this.rawEditor;
      const textNode = range.startContainer;
      const prefix = textNode.textContent.slice(0, range.startOffset);
      const infix = input == " " ? NON_BREAKING_SPACE : input;
      const postfix = textNode.textContent.slice(range.endOffset);
      textNode.textContent = `${prefix}${infix}${postfix}`;
      rawEditor.updateRichNode();
      rawEditor.setCarret(range.startContainer, range.startOffset + 1);
    }
    return HandlerResponse.create(
      {
        allowPropagation: false
      }
    );
  }

  aSelectionWeUnderstand() {
    let windowSelection = window.getSelection();
    if (windowSelection.rangeCount === 0)
      return false;
    let range = windowSelection.getRangeAt(0);
    if (this.rawEditor.rootNode.contains(range.commonAncestorContainer)) {
      let startNode = this.rawEditor.getRichNodeFor(range.startContainer);
      let endNode = this.rawEditor.getRichNodeFor(range.endContainer);
      if (startNode && startNode === endNode && startNode.type === 'text')
        return true;
    }
    else
      return false;
  }

  /**
   * Insert text at provided position,
   *
   * @method insertText
   * @param {String} text to insert
   * @param {Number} position
   *
   * @return {DOMNode} node
   * @public
   */
  insertText(text, position) {
    if (!this.rawEditor.richNode) {
      warn(`richNode wasn't set before inserting text onposition ${position}`,{id: 'content-editable.rich-node-not-set'});
      this.rawEditor.updateRichNode();
    }
    const textNode = this.rawEditor.findSuitableNodeForPosition(position);
    const type = textNode.type;
    let domNode;
    if (type === 'text') {
      if (text === " ") {
        text = NON_BREAKING_SPACE;
      }
      domNode = textNode.domNode;
      const relativePosition = position - textNode.start;
      sliceTextIntoTextNode(domNode, text, relativePosition);
      if (relativePosition > 0 && text !== NON_BREAKING_SPACE &&  domNode.textContent[relativePosition-1] === NON_BREAKING_SPACE) {
        // replace non breaking space preceeding input with a regular space
        let content = domNode.textContent;
        domNode.textContent = content.slice(0, relativePosition - 1) + " " + content.slice(relativePosition);
      }
      this.rawEditor.setCarret(domNode, relativePosition + 1);
    }
    else {
      // we should always have a suitable text node... last attempt to safe things somewhat
      warn(`no text node found at position ${position} (editor empty?)`, {id: 'content-editable.no-text-node-found'});
      domNode = document.createTextNode(text);
      textNode.domNode.appendChild(domNode);
      this.rawEditor.set('currentNode', domNode);
    }
    if (this.forceParagraph &&  domNode.parentNode === this.rawEditor.rootNode) {
      const paragraph = document.createElement('p');
      domNode.replaceWith(paragraph);
      paragraph.append(domNode);
    }
    this.rawEditor.updateRichNode();
    return domNode;
  }
}
export { supportedInputCharacters } ;
