import EmberObject from '@ember/object';
import { reads, alias } from '@ember/object/computed';
import HandlerResponse from './handler-response';
import { get } from '@ember/object';

const supportedInputCharacters = /[a-zA-Z0-9.,!@#$%^&*={};'"+-?_()/\\ ]/;
/**
 * Text Input Handler, a event handler to handle text input
 *
 * @module contenteditable-editor
 * @class TextInputHandler
 * @constructor
 * @extends EmberObject
 */
export default EmberObject.extend({
  currentNode: alias('rawEditor.currentNode'),
  currentSelection: reads('rawEditor.currentSelection'),
  currentSelectionIsACursor: reads('rawEditor.currentSelectionIsACursor'),
  richNode: reads('rawEditor.richNode'),
  rootNode: reads('rawEditor.rootNode'),
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
    return ( this.get('currentSelectionIsACursor') || this.aSelectionWeUnderstand() ) &&
      inp.length === 1 && ! event.ctrlKey && !event.altKey && supportedInputCharacters.test(inp);
  },


  /**
   * handle the event
   * @method handleEvent
   * @param {DOMEvent} event
   * @return {HandlerResponse} response
   */
  handleEvent(event) {
    let input = event.key;
    if (this.get('currentSelectionIsACursor')) {
      let position = this.get('currentSelection')[0];
      this.get('rawEditor').insertText(input, position);
      this.get('rawEditor').setCurrentPosition(position + input.length);
    }
    else {
      let range = window.getSelection().getRangeAt(0);
      let rawEditor = this.get('rawEditor');
      let startNode = rawEditor.getRichNodeFor(range.startContainer);
      let start = rawEditor.calculatePosition(startNode, range.startOffset);
      let endNode = rawEditor.getRichNodeFor(range.endContainer);
      let end = rawEditor.calculatePosition(endNode, range.endOffset);
      let elements = rawEditor.replaceTextWithHTML(start, end, input);
      this.set('currentNode', elements[0]);
      rawEditor.setCurrentPosition(start + input.length);
    }
    return HandlerResponse.create(
      {
        allowPropagation: false
      }
    );
  },

  aSelectionWeUnderstand() {
    let windowSelection = window.getSelection();
    if (windowSelection.rangeCount === 0)
      return false;
    let range = windowSelection.getRangeAt(0);
    if (this.get('rootNode').contains(range.commonAncestorContainer)) {
      let startNode = this.get('rawEditor').getRichNodeFor(range.startContainer);
      let endNode = this.get('rawEditor').getRichNodeFor(range.endContainer);
      if (startNode && startNode === endNode && get(startNode,'type') === 'text')
        return true;
    }
    else
      return false;
  }
});
export { supportedInputCharacters } ;
