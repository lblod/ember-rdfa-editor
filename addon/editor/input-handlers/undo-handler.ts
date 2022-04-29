import { InputHandler } from '@lblod/ember-rdfa-editor/editor/input-handlers/input-handler';
import { HandlerResponse } from '@lblod/ember-rdfa-editor/editor/input-handlers/handler-response';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { isKeyDownEvent } from '@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers';

export default class UndoHandler extends InputHandler {
  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
  }

  isHandlerFor(event: Event): boolean {
    return (
      isKeyDownEvent(event) &&
      (event.ctrlKey || event.metaKey) &&
      event.key === 'z'
    );
  }

  handleEvent(_: KeyboardEvent): HandlerResponse {
    this.rawEditor.executeCommand('undo');
    return { allowPropagation: false, allowBrowserDefault: false };
  }
}
