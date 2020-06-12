import HandlerResponse from './handler-response';
import boldProperty from '../../rdfa/bold-property';
import italicProperty from '../../rdfa/italic-property';
import underlineProperty from '../../rdfa/underline-property';

/**
 * BoldItalicUnderlineHandler, a event handler to restore editor state if all else failed
 *
 * @module contenteditable-editor
 * @class BoldItalicUnderlineHandler
 * @constructor
 */
export default class BoldItalicUnderlineHandler {

  rawEditor;
  constructor({rawEditor}) {
    this.rawEditor = rawEditor;
  }

  isHandlerFor(event) {
    return event.type == "keydown" && ["b","i","u"].includes(event.key) && (event.ctrlKey || event.metaKey);
  }


  handleEvent(event) {
    let property;
    switch(event.key) {
    case "b":
      property = boldProperty;
      break;
    case "u":
      property = underlineProperty;
      break;
    case "i":
      property = italicProperty;
      break;
    }
    const range = this.rawEditor.currentSelection;
    const selection = this.rawEditor.selectCurrentSelection();
    this.rawEditor.toggleProperty(selection, property);
    // set cursor at end of selection, TODO: check what other editors do but this feels natural
    this.rawEditor.setCurrentPosition(range[1]);
    return HandlerResponse.create({ allowBrowserDefault: false, allowPropagation: false });
  }
}
