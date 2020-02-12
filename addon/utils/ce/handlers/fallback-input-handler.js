import HandlerResponse from './handler-response';

/**
 * Fallback Input Handler, a event handler to restore editor state if all else failed
 *
 * @module contenteditable-editor
 * @class TextInputHandler
 * @constructor
 */
class FallbackInputHandler {

  rawEditor;
  constructor({rawEditor}) {
    this.rawEditor = rawEditor;
  }

  isHandlerFor(event) {
    if (event.type == "keydown" && ["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(event.key)) {
      // we capture these on key up and not down (e.g after the motion was applied)
      return false;
    }
    if (event.type == "keyup" && ["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(event.key)) {
      return true;
    }
    if (! ["keydown", "keyup", "mousedown"].includes(event.type)){
      // keydown is before anything happens and thus not interesting for fallback
      // motion events were captured above this if we don't want catch other keyup events, they also generate an input event which we do handle
      // mousedown is not interesting at the moment, only mouse up
      return true;
    }
  }


  handleEvent(event) {
    this.rawEditor.externalDomUpdate(`uncaptured input event of type ${event.type}, restoring editor state`, () => {});
    return HandlerResponse.create({ allowBrowserDefault: true });
  }
}

export default FallbackInputHandler;
