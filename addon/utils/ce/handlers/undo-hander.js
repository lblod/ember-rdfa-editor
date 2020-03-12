import HandlerResponse from './handler-response';

/**
 * Undo handler, this handler acts on ctrl+z or meta+z and calls undo on the editor
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
    if (event.type == "keydown" && (event.ctrlKey || event.metaKey) && event.key == "z")
      return true;
    else
      return false;
  }


  handleEvent(event) {
    this.rawEditor.undo();
    return HandlerResponse.create({ allowBrowserDefault: true, allowPropagation: false });
  }
}

export default FallbackInputHandler;
