import TextInputHandler from '../../ce/handlers/text-input-handler';
import HandlerResponse from '../../ce/handlers/handler-response';
import { isAllWhitespace, invisibleSpace } from '../../ce/dom-helpers';

export default class InputDataRemovedHandler extends TextInputHandler {
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
      return super.isHandlerFor(...arguments) &&
        this.stringToVisibleText(parentNode.innerText).length < 4 &&
        parentNode &&
        parentNode.getAttribute('data-flagged-remove');
    }
    else {
      return false;
    }
  }

  handleEvent(){
    //this is the span
    const currentNode = this.rawEditor.currentNode;
    const parentNode = currentNode.parentNode;
    const length = this.stringToVisibleText(parentNode.innerText).length;
    if ( length > 0 && length < 3 ) {
      if (isAllWhitespace(currentNode))
        currentNode.textContent = '';
      currentNode.parentNode.setAttribute('data-flagged-remove', 'almost-complete');
    }
    else
      currentNode.parentNode.removeAttribute('data-flagged-remove');
    return HandlerResponse.create({});
  }


    //TODO: move to util
  stringToVisibleText(foo) {
    // \s as per JS [ \f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff].
    return foo
      .replace(invisibleSpace,'')
      .replace(/[ \f\n\r\t\v\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g,'');
  }
}
