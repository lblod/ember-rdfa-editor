import HandlerResponse from './handler-response';

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
