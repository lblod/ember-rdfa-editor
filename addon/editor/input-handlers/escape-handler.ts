import { InputHandler } from './input-handler';
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";

/**
 * Escape Handler, an event handler to handle escape
 *
 * @module contenteditable-editor
 * @class EscapeHandler
 * @constructor
 */
export default class EscapeHandler extends InputHandler {

  constructor( {rawEditor} : { rawEditor: PernetRawEditor} ) {
    super(rawEditor);
  }

  isHandlerFor(event: Event) {
    if (event.type == "keydown") {
      const keyboardEvent = event as KeyboardEvent;
      if(keyboardEvent.key !== 'Escape') {
        // key is not escape, we don't want to handle it
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

  handleEvent() {
    const activeElement = document.activeElement;
    if(activeElement) {
      const htmlActiveElement = activeElement as HTMLElement;
      htmlActiveElement.blur();
    }
    return { allowPropagation: false };
  }
}

