import HandlerResponse from './handler-response';
import nextTextNode from '../next-text-node';

/**
 * Enter Handler, a event handler to handle the generic enter case
 * @module contenteditable-editor
 * @class EnterHandler
 * @constructor
 * @extends EmberObject
 */
export default class EnterHandler {
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
    return (event.type === "keydown" && event.key === "Tab" && this.rawEditor.currentNode);
  }

  /**
   * handle arrow event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent() {
    const currentNode = this.rawEditor.currentNode;
    const nextNode = nextTextNode(currentNode);
    this.rawEditor.updateRichNode();
    this.rawEditor.setCarret(nextNode, 0);
    return HandlerResponse.create({ allowPropagation: false });
  }
}
