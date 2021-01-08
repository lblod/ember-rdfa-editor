import HandlerResponse from './handler-response';
import boldProperty from '../../rdfa/bold-property';
import italicProperty from '../../rdfa/italic-property';
import underlineProperty from '../../rdfa/underline-property';
import {PropertyState} from "@lblod/ember-rdfa-editor/utils/ce/model-selection-tracker";

/**
 * BoldItalicUnderlineHandler, a event handler to restore editor state if all else failed
 *
 * @module contenteditable-editor
 * @class BoldItalicUnderlineHandler
 * @constructor
 */
export default class BoldItalicUnderlineHandler {

  rawEditor;
  isBold = false;
  isItalic = false;
  isUnderline = false;
  isStrikethrough = false;

  constructor({rawEditor}) {
    this.rawEditor = rawEditor;
    document.addEventListener("richSelectionUpdated", this.updateProperties.bind(this));
  }

  isHandlerFor(event) {
    return event.type == "keydown" && ["b","i","u"].includes(event.key) && (event.ctrlKey || event.metaKey);
  }

  updateProperties(event) {
    this.isBold = event.detail.bold === PropertyState.enabled;
    this.isItalic = event.detail.italic === PropertyState.enabled;
    this.isUnderline = event.detail.underline === PropertyState.enabled;
    this.isStrikethrough = event.detail.strikethrough === PropertyState.enabled;
  }


  handleEvent(event) {
    let property;
    switch(event.key) {
    case "b":
      property = this.isBold ? "remove-bold" : "make-bold";
      break;
    case "u":
      property = this.isUnderline ? "remove-underline" : "make-underline";
      break;
    case "i":
      property = this.isItalic  ? "remove-italic" : "make-italic";
      break;
    }
    this.rawEditor.executeCommand(property);
    return HandlerResponse.create({ allowBrowserDefault: false, allowPropagation: false });
  }
}
