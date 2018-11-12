import InputTextHandler from '@lblod/ember-contenteditable-editor/utils/text-input-handler';
import HandlerResponse from '@lblod/ember-contenteditable-editor/utils/handler-response';

export default InputTextHandler.extend({
  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {DOMEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(){
    const currentNode = this.rawEditor.currentNode;
    const parentNode = currentNode.parentNode;
    return this._super(...arguments) &&
      currentNode.length < 4 &&
      parentNode &&
      parentNode.getAttribute('data-flagged-remove');
  },

  handleEvent(){
    //this is the span
    const currentNode = this.rawEditor.currentNode;
    const length = currentNode.length;
    if ( length > 0 && length < 3 ) {
      currentNode.parentNode.setAttribute('data-flagged-remove', 'almost-complete');
    }
    else
      currentNode.parentNode.removeAttribute('data-flagged-remove');
    return new HandlerResponse();
  }
});
