import InputTextHandler from '../ce/text-input-handler';
import HandlerResponse from '../ce/handler-response';
import { isAllWhitespace } from '../ce/dom-helpers';

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
    if (currentNode) {
      const parentNode = currentNode.parentNode;
      return this._super(...arguments) &&
        currentNode.length < 4 &&
        parentNode &&
        parentNode.getAttribute('data-flagged-remove');
    }
    else {
      return false;
    }
  },

  handleEvent(){
    //this is the span
    const currentNode = this.rawEditor.currentNode;
    const length = currentNode.length;
    if ( length > 0 && length < 3 ) {
      if (isAllWhitespace(currentNode))
        currentNode.textContent = '';
      currentNode.parentNode.setAttribute('data-flagged-remove', 'almost-complete');
    }
    else
      currentNode.parentNode.removeAttribute('data-flagged-remove');
    return new HandlerResponse();
  }
});
