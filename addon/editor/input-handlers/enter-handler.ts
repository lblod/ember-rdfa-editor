import { InputHandler } from './input-handler';
import PernetRawEditor from '@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor';
import { isKeyDownEvent } from '@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers';

/**
 * EnterHandler, an event handler to handle the generic enter case.
 *
 * @module contenteditable-editor
 * @class EnterHandler
 * @constructor
 */
export default class EnterHandler extends InputHandler {
  constructor({ rawEditor }: { rawEditor: PernetRawEditor }) {
    super(rawEditor);
  }

  isHandlerFor(event: Event) {
    return isKeyDownEvent(event) && event.key === 'Enter';
  }

  handleEvent(_: KeyboardEvent) {
    //TODO (sergey): this is hacky and very quick should be redone
    if (this.rawEditor.canExecuteCommand('insert-newLi')) {
      this.rawEditor.executeCommand('insert-newLi');
      return { allowPropagation: false, allowBrowserDefault: false };
    } else if (this.rawEditor.canExecuteCommand('insert-newLine')) {
      this.rawEditor.executeCommand('insert-newLine');
      return { allowPropagation: false, allowBrowserDefault: false };
    } else {
      return { allowPropagation: true, allowBrowserDefault: true };
    }
  }
}
