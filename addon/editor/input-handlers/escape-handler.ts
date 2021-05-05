import { InputHandler } from './input-handler';
import LegacyRawEditor from "@lblod/ember-rdfa-editor/utils/ce/legacy-raw-editor";

/**
 * Escape Handler, an event handler to handle escape
 *
 * @module contenteditable-editor
 * @class EscapeHandler
 * @constructor
 */
export default class EscapeHandler extends InputHandler {

  constructor( {rawEditor} : { rawEditor: LegacyRawEditor} ) {
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

