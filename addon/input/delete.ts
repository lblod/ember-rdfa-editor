import { Editor } from '@lblod/ember-rdfa-editor/core/editor';
import ModelRange from '../model/model-range';
import { eventTargetRange } from './utils';

export function handleDelete(
  editor: Editor,
  event: InputEvent,
  direction: number
): void {
  event.preventDefault();
  let range = eventTargetRange(editor.state, editor.view.domRoot, event);
  if (range.collapsed) {
    const shifted = range.start.shiftedVisually(direction);
    range =
      direction === -1
        ? new ModelRange(shifted, range.start)
        : new ModelRange(range.start, shifted);
  }
  editor.executeCommand('remove', { range });
}
