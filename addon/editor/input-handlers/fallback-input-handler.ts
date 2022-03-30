import { InputHandler } from '@lblod/ember-rdfa-editor/editor/input-handlers/input-handler';
import PernetRawEditor from '@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor';
import { HandlerResponse } from '@lblod/ember-rdfa-editor/editor/input-handlers/handler-response';
import {
  isInputEvent,
  isKeyUpEvent,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers';

export default class FallbackInputHandler extends InputHandler {
  private readonly FALLBACK_KEY_UP_KEYS = [
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'Home',
    'End',
  ];
  private readonly HANDLED_EVENT_TYPES = [
    'keydown',
    'keyup',
    'mousedown',
    'beforeinput',
  ];

  constructor({ rawEditor }: { rawEditor: PernetRawEditor }) {
    super(rawEditor);
  }

  isHandlerFor(event: Event): boolean {
    return (
      (isKeyUpEvent(event) && this.FALLBACK_KEY_UP_KEYS.includes(event.key)) ||
      (isInputEvent(event) && event.inputType !== 'deleteContentBackward') ||
      // Keydown is before anything happens and thus not interesting for fallback.
      // Motion events were captured above this if we don't want catch other keyup events,
      // they also generate an input event which we do handle.
      // Mouse down is not interesting at the moment, only mouse up.
      !this.HANDLED_EVENT_TYPES.includes(event.type)
    );
  }

  handleEvent(event: Event): HandlerResponse {
    this.rawEditor.externalDomUpdate(
      `Uncaptured event of type ${event.type}, restoring editor state.`
    );
    this.rawEditor.model.read();
    this.rawEditor.model.saveSnapshot();
    return { allowPropagation: false, allowBrowserDefault: true };
  }
}
