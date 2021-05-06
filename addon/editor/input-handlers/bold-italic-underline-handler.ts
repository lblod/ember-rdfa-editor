import {InputHandler} from './input-handler';
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {PropertyState} from "@lblod/ember-rdfa-editor/model/util/types";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";


/**
 * BoldItalicUnderlineHandler, a event handler to restore editor state if all else failed
 *
 * @module contenteditable-editor
 * @class BoldItalicUnderlineHandler
 * @constructor
 */
export default class BoldItalicUnderlineHandler extends InputHandler {

  isBold = false;
  isItalic = false;
  isUnderline = false;
  isStrikethrough = false;

  constructor({ rawEditor }: { rawEditor: PernetRawEditor }) {
    super(rawEditor);
    document.addEventListener("richSelectionUpdated", this.updateProperties.bind(this));
  }

  isHandlerFor(event: Event) {
    if (event.type == "keydown") {
      const keyboardEvent = event as KeyboardEvent;
      return ["b", "i", "u"].includes(keyboardEvent.key) && (keyboardEvent.ctrlKey || keyboardEvent.metaKey);
    }
    else {
      return false;
    }
  }

  updateProperties(event: CustomEvent<ModelSelection>) {
    this.isBold = event.detail.bold === PropertyState.enabled;
    this.isItalic = event.detail.italic === PropertyState.enabled;
    this.isUnderline = event.detail.underline === PropertyState.enabled;
    this.isStrikethrough = event.detail.strikethrough === PropertyState.enabled;
  }


  handleEvent(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    let property;
    switch (keyboardEvent.key) {
      case "b":
        property = this.isBold ? "remove-bold" : "make-bold";
        break;
      case "u":
        property = this.isUnderline ? "remove-underline" : "make-underline";
        break;
      case "i":
        property = this.isItalic ? "remove-italic" : "make-italic";
        break;
    }
    if (property) {
      this.rawEditor.executeCommand(property);
      return { allowBrowserDefault: false, allowPropagation: false };
    }
    else {
      return { allowBrowserDefault: true, allowPropagation: true};
    }
  }
}
