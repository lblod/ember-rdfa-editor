import { InputHandler } from '@lblod/ember-rdfa-editor/editor/input-handlers/input-handler';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { HandlerResponse } from '@lblod/ember-rdfa-editor/editor/input-handlers/handler-response';

export default class IgnoreModifiersHandler extends InputHandler {
  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
  }

  isHandlerFor(event: Event): boolean {
    return (
      event instanceof KeyboardEvent &&
      ['Alt', 'Control', 'Meta', 'Shift'].includes(event.key)
    );
  }

  handleEvent(_: KeyboardEvent): HandlerResponse {
    return { allowPropagation: false, allowBrowserDefault: false };
  }
}
