import HandlerResponse from './handler-response';
import nextTextNode from '../next-text-node';

/**
 * @module contenteditable-editor
 * @class TabHandler
 * @constructor
 */
export default class TabHandler {
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
   * handle tab event
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
