import HandlerResponse from './handler-response';

/**
 * Fallback Input Handler, a event handler to restore editor state for certain events
 *
 * @module contenteditable-editor
 * @class FallbackInputHandler
 * @constructor
 */
export default class FallbackInputHandler {

  rawEditor;
  constructor({rawEditor}) {
    this.rawEditor = rawEditor;
  }

  isHandlerFor(event) {
    if (event.type == "keyup" && ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(event.key)) {
      return true;
    }
    else if (event.type == "input" && event.inputType == "deleteContentBackward") {
      return false;
    }
    else if (! ["keydown", "keyup", "mousedown"].includes(event.type)){
      // keydown is before anything happens and thus not interesting for fallback
      // motion events were captured above this if we don't want catch other keyup events, they also generate an input event which we do handle
      // mousedown is not interesting at the moment, only mouse up
      return true;
    }
    return false;
  }


  handleEvent(event) {
    this.rawEditor.externalDomUpdate(`uncaptured input event of type ${event.type}, restoring editor state`, () => {});
    return HandlerResponse.create({ allowBrowserDefault: true });
  }
}
