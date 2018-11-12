import InputTextHandler from '@lblod/ember-contenteditable-editor/utils/input-text-handler';
const supportedInputCharacters = /[a-zA-Z0-9.,!@#$%^&*={};'"+-?_()/\\ ]/;

export default InputTextHandler.extend({
  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {DOMEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(event){
    const currentNode = this.rawEditor.currentNode;
    const parentNode = currentNode.parentNode;
    return this._super(...arguments) &&
      currentNode.length < 4;
      parentNode
      && parentNode.getAttribute('data-flagged-remove');
  },

  handleEvent(){
    //this is the span
    this._super();
    const currentNode = this.rawEditor.currentNode;
    const length = currentNode.length;
    if ( length > 0 && length < 2 ) {
      currentNode.parentNode.setAttribute('data-flagged-remove', 'almost-complete');
    }
    else
      currentNode.parentNode.removeAttribute('data-flagged-remove');
  },


});
