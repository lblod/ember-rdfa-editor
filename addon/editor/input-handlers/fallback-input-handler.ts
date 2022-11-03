import { InputHandler } from '@lblod/ember-rdfa-editor/editor/input-handlers/input-handler';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { HandlerResponse } from '@lblod/ember-rdfa-editor/editor/input-handlers/handler-response';
import {
  isInInlineComponent,
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
    'mouseup',
    'beforeinput',
  ];

  constructor({ rawEditor }: { rawEditor: RawEditor }) {
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
      (!this.HANDLED_EVENT_TYPES.includes(event.type) &&
        !isInInlineComponent(event))
    );
  }

  handleEvent(event: Event): HandlerResponse {
    console.log(event);
    this.rawEditor.model.read();
    this.rawEditor.model.saveSnapshot();
    return { allowPropagation: false, allowBrowserDefault: true };
  }
}
