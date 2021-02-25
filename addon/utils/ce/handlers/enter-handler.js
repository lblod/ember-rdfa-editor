import getRichNodeMatchingDomNode from '../get-rich-node-matching-dom-node';
import {
  tagName,
  isDisplayedAsBlock,
  invisibleSpace,
  insertNodeBAfterNodeA,
  insertTextNodeWithSpace
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import HandlerResponse from './handler-response';
import { debug } from '@ember/debug';
import { isBlank } from '@ember/utils';

/**
 * Enter Handler, a event handler to handle the generic enter case
 * @module contenteditable-editor
 * @class EnterHandler
 * @constructor
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
    return this.rawEditor.currentNode && event.type === "keydown" && event.key === "Enter" && this.rawEditor.currentSelectionIsACursor;
  }

  /**
   * handle enter event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent(event) {
    if(this.rawEditor.canExecuteCommand('insert-newLi')){

      this.rawEditor.ExecuteCommand('insert-newLi');

      return HandlerResponse.create({allowPropagation: false});
    }
    else if(this.rawEditor.canExecuteCommand('insert-newLine')){
      this.rawEditor.ExecuteCommand('insert-newLine');
      return HandlerResponse.create({allowPropagation: false});
    }
    else{
      return HandlerResponse.create({allowPropagation: true, allowBrowserDefault: true});
    }
  }

}
