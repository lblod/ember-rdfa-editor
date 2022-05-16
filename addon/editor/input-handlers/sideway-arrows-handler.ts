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
      isKeyDownEvent(event) &&
      !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) &&
      ['ArrowLeft', 'ArrowRight'].includes(event.key)
    );
  }
  handleEvent(event: KeyboardEvent): HandlerResponse {
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    const selection = this.rawEditor.model.selection;
    const start = selection.ranges[0].start;
    const end = selection.lastRange?.end;
    if (end && start.sameAs(end)) {
      const newPosition = start.shiftedVisually(direction);
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
