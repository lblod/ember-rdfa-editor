import EmberObject from '@ember/object';
import { reads } from '@ember/object/computed';
import HandlerResponse from './handler-response';
import previousTextNode from '../previous-text-node';
import nextTextNode from '../next-text-node';
import { warn } from '@ember/debug';
import { isInLumpNode, getNextNonLumpTextNode, getPreviousNonLumpTextNode, animateLumpNode, getParentLumpNode } from '../lump-node-utils';

/**
 * Arrow Handler, a event handler to handle arrow keys.
 * __Note__: Currently only left and right arrow keys are supported
 *
 * @module contenteditable-editor
 * @class ArrowHandler
 * @constructor
 * @extends EmberObject
 */
export default EmberObject.extend({
  currentSelection: reads('rawEditor.currentSelection'),

  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {DOMEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(event){
    return event.type === "keydown" && (event.key === 'ArrowLeft' || event.key === 'ArrowRight') && this.get('rawEditor.currentSelectionIsACursor');
  },

  /**
   * handle backspace event
   * @method handleEvent
   * @return {Object} HandlerResponse.create({allowPropagation: false})
   * @public
   */
  handleEvent(event){
    const position = this.currentSelection[0];
    const textNode = this.rawEditor.currentNode;
    const richNode = this.rawEditor.getRichNodeFor(textNode);
    const isLeft = event.key === "ArrowLeft";
    const isRight = ! isLeft;
    if (richNode.start < position && richNode.end > position) {
      // not at the start or end of a node
      const relativePosition = position - richNode.start;
      if (isLeft) {
        this.rawEditor.setCarret(textNode, relativePosition - 1 );
      }
      else {
        this.rawEditor.setCarret(textNode, relativePosition + 1);
      }
    }
    else if (richNode.start === position) {
      // start of node
      if (isLeft) {
        let newNode = previousTextNode(textNode, this.rawEditor.rootNode);
        if(isInLumpNode(newNode)){
          animateLumpNode(getParentLumpNode(newNode));
          newNode = getPreviousNonLumpTextNode(newNode, this.rawEditor.rootNode);
        }
        this.rawEditor.updateRichNode();
        this.rawEditor.setCarret(newNode,newNode.textContent.length);
      }
      else {
        this.rawEditor.setCarret(textNode, 1);
      }
    }
    else if (richNode.end === position){
      // end of node
      if (isRight) {
        let newNode = nextTextNode(textNode, this.rawEditor.rootNode);
        if(isInLumpNode(newNode)){
          animateLumpNode(getParentLumpNode(newNode));
          newNode = getNextNonLumpTextNode(newNode, this.rawEditor.rootNode);
        }
        this.rawEditor.updateRichNode();
        this.rawEditor.setCarret(newNode, 0);
      }
      else {
        this.rawEditor.setCarret(textNode, textNode.textContent.length - 1);
      }
    }
    else {
      warn(`position ${position} is not inside current node.`, {id: 'contenteditable.invalid-starte'});
    }
    return HandlerResponse.create({allowPropagation: false});
  }
});
