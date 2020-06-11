import HandlerResponse from './handler-response';

/**
 * Undo handler, this handler acts on ctrl+z or meta+z and calls undo on the editor
 *
 * @module contenteditable-editor
 * @class UndoHandler
 * @constructor
 */
export default class UndoHandler {

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


  handleEvent(/* event */) {
    this.rawEditor.undo();
    return HandlerResponse.create({ allowBrowserDefault: true, allowPropagation: false });
  }
}
