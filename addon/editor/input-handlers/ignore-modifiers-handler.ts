import { InputHandler } from '@lblod/ember-rdfa-editor/editor/input-handlers/input-handler';
import PernetRawEditor from '@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor';
import { HandlerResponse } from '@lblod/ember-rdfa-editor/editor/input-handlers/handler-response';

export default class IgnoreModifiersHandler extends InputHandler {
  constructor({ rawEditor }: { rawEditor: PernetRawEditor }) {
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
