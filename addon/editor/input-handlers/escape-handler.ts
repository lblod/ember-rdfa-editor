import { InputHandler } from './input-handler';
import { RawEditor } from '../raw-editor';

/**
 * Escape Handler, an event handler to handle escape
 *
 * @module contenteditable-editor
 * @class EscapeHandler
 * @constructor
 */
export default class EscapeHandler implements InputHandler {
  rawEditor: RawEditor;

  constructor( {rawEditor} : { rawEditor: RawEditor} ) {
    this.rawEditor = rawEditor;
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
      const parentNode = this.rawEditor.rootNode.parentNode;
      if(parentNode) {
        const htmlParentNode = parentNode as HTMLElement;
        htmlParentNode.focus();
      }
    }
    return { allowPropagation: false };
  }
}

