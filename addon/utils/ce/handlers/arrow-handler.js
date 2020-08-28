import HandlerResponse from './handler-response';
import previousTextNode from '../previous-text-node';
import nextTextNode from '../next-text-node';
import { warn } from '@ember/debug';

/**
 * Arrow Handler, a event handler to handle arrow keys.
 * __Note__: Currently only left and right arrow keys are supported
 *
 * @module contenteditable-editor
 * @class ArrowHandler
 * @constructor
 */
export default class ArrowHandler {
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
    return event.type === "keydown" && (event.key === 'ArrowLeft' || event.key === 'ArrowRight') && this.rawEditor.currentSelectionIsACursor;
  }

  /**
   * handle arrow event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent(event) {
    const position = this.rawEditor.currentSelection[0];
    const textNode = this.rawEditor.currentNode;
    const richNode = this.rawEditor.getRichNodeFor(textNode);
    const isLeft = event.key === "ArrowLeft";
    const isRight = ! isLeft;
    if (richNode.start < position && richNode.end > position) {
      // not at the start or end of a node
      const relativePosition = position - richNode.start;
      if (isLeft) {
        this.rawEditor.setCaret(textNode, relativePosition - 1 );
      }
      else {
        this.rawEditor.setCaret(textNode, relativePosition + 1);
      }
    }
    else if (richNode.start === position) {
      // start of node
      if (isLeft) {
        let newNode = previousTextNode(textNode, this.rawEditor.rootNode);
        this.rawEditor.updateRichNode();
        this.rawEditor.setCaret(newNode,newNode.textContent.length);
      }
      else {
        if (textNode.length > 1) {
          this.rawEditor.setCaret(textNode, 1);
        }
        else {
          let newNode = nextTextNode(textNode, this.rawEditor.rootNode);
          this.rawEditor.updateRichNode();
          this.rawEditor.setCaret(newNode, 0);
        }
      }
    }
    else if (richNode.end === position){
      // end of node
      if (isRight) {
        let newNode = nextTextNode(textNode, this.rawEditor.rootNode);
        this.rawEditor.updateRichNode();
        this.rawEditor.setCaret(newNode, 0);
      }
      else {
        if (textNode.length > 1) {
          this.rawEditor.setCaret(textNode, textNode.textContent.length - 1);
        }
        else {
          let newNode = previousTextNode(textNode, this.rawEditor.rootNode);
          this.rawEditor.updateRichNode();
          this.rawEditor.setCaret(newNode, newNode.length);
        }
      }
    }
    else {
      warn(`position ${position} is not inside current node.`, {id: 'contenteditable.invalid-starte'});
    }
    return HandlerResponse.create({allowPropagation: false});
  }

}
