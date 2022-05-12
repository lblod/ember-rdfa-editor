import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { isKeyDownEvent } from './event-helpers';
import { HandlerResponse } from './handler-response';
import { InputHandler } from './input-handler';

export default class SidewayArrowsHandler extends InputHandler {
  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
  }

  isHandlerFor(event: Event): boolean {
    return (
      isKeyDownEvent(event) && ['ArrowLeft', 'ArrowRight'].includes(event.key)
    );
  }
  handleEvent(event: KeyboardEvent): HandlerResponse {
    const selection = this.rawEditor.model.selection;
    const selectionEnd = selection.lastRange?.end;
    if (selectionEnd) {
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      const newPosition = selectionEnd.shiftedVisually(direction);
      const range = new ModelRange(newPosition);
      this.rawEditor.model.change(() => {
        this.rawEditor.model.selectRange(range);
      });

      return { allowBrowserDefault: false, allowPropagation: false };
    } else {
      return { allowBrowserDefault: true, allowPropagation: true };
    }
  }
}
