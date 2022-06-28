import { InputHandler } from './input-handler';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { isKeyDownEvent } from '@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers';

/**
 * EnterHandler, an event handler to handle the generic enter case.
 *
 * @module contenteditable-editor
 * @class EnterHandler
 * @constructor
 */
export default class BackspaceHandler extends InputHandler {
  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
  }

  isHandlerFor(event: Event) {
    return isKeyDownEvent(event) && event.key === 'Backspace';
  }

  handleEvent(_: KeyboardEvent) {
    this.rawEditor.executeCommand('remove', 'left');
    console.log('BACKSPACE AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    return { allowPropagation: true, allowBrowserDefault: false };
  }
}
