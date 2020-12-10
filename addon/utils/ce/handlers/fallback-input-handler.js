import HandlerResponse from './handler-response';
const IGNORED_EVENT_TYPES = ["keydown", "mousedown", "beforeinput", "keyup"];
const INTERESTING_KEYS = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"];

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
    // exceptions

    if (event.type == "input" && event.inputType == "deleteContentBackward") {
      return false;
    }
    if (event.type == "keyup" && INTERESTING_KEYS.includes(event.key)) {
      return true;
    }

    // General behavior

    if(IGNORED_EVENT_TYPES.includes(event.type)) {
      return false;
    }
    return true;
  }


  handleEvent(event) {
    this.rawEditor.externalDomUpdate(`uncaptured input event of type ${event.type}, restoring editor state`, () => {});
    this.rawEditor.updateRichNode();
    return HandlerResponse.create({ allowBrowserDefault: true });
  }
}
