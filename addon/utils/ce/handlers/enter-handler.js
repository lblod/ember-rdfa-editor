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
    return event.type === "keydown" && event.key === "Enter";
  }

  /**
   * handle enter event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent(event) {
    //TODO (sergey):this is hacky and very quick should be redone
    if(this.rawEditor.canExecuteCommand('insert-newLi')){
      this.rawEditor.executeCommand('insert-newLi');
      return HandlerResponse.create({allowPropagation: false, allowBrowserDefault: false});
    }
    else if(this.rawEditor.canExecuteCommand('insert-newLine')){
      this.rawEditor.executeCommand('insert-newLine');
      return HandlerResponse.create({allowPropagation: false, allowBrowserDefault: false});
    }
    else{
      return HandlerResponse.create({allowPropagation: true, allowBrowserDefault: true});
    }
  }

}
