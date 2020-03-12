import EmberObject from '@ember/object';
import { reads } from '@ember/object/computed';
import HandlerResponse from './handler-response';

/**
 * Delete Handler, a event handler to handle the generic delete case
 *
 * @module contenteditable-editor
 * @class DeleteHandler
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
  isHandlerFor(event){
    console.log(event)
    return event.type === "keydown"
      && event.key === 'Delete'
      && this.get('rawEditor.currentSelectionIsACursor')
      && this.doesCurrentNodeBelongsToContentEditable();
  },

  doesCurrentNodeBelongsToContentEditable(){
    return this.currentNode && this.currentNode.parentNode && this.currentNode.parentNode.isContentEditable;
  },

  /**
   * handle delete event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent() {
    console.log('Handler called')
    return HandlerResponse.create({ allowPropagation: false });
  },

});
