import { InputHandler } from '@lblod/ember-rdfa-editor/editor/input-handlers/input-handler';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { isKeyDownEvent } from '@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers';
import { HandlerResponse } from '@lblod/ember-rdfa-editor/editor/input-handlers/handler-response';

export default class DisableDeleteHandler extends InputHandler {
  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
  }

  isHandlerFor(event: Event): boolean {
    return isKeyDownEvent(event) && event.key === 'Delete';
  }

  handleEvent(_: KeyboardEvent): HandlerResponse {
    return { allowPropagation: false, allowBrowserDefault: false };
  }
}
