import { InputHandler } from './input-handler';
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import {isKeyDownEvent} from "@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers";

/**
 * EscapeHandler, an event handler to handle escape.
 *
 * @module contenteditable-editor
 * @class EscapeHandler
 * @constructor
 */
export default class EscapeHandler extends InputHandler {
  constructor({rawEditor}: {rawEditor: PernetRawEditor}) {
    super(rawEditor);
  }

  isHandlerFor(event: Event) {
    return isKeyDownEvent(event) && event.key === "Escape";
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

