import HandlerResponse from './handler-response';

/**
 * Delete Handler, a event handler to handle the generic delete case
 *
 * @module contenteditable-editor
 * @class DeleteHandler
 * @constructor
 * @extends EmberObject
 */

export default class DeleteHandler {
  constructor({rawEditor}) {
    this.rawEditor = rawEditor
  }
  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {DOMEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(event){
    return event.type === "keydown"
      && event.key === 'Delete'
      && this.rawEditor.currentSelectionIsACursor
      && this.doesCurrentNodeBelongsToContentEditable();
  }

  doesCurrentNodeBelongsToContentEditable(){
    return this.rawEditor.currentNode && this.rawEditor.currentNode.parentNode && this.rawEditor.currentNode.parentNode.isContentEditable;
  }

  /**
   * handle delete event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent() {
    return HandlerResponse.create({ allowPropagation: false });
  }

}
