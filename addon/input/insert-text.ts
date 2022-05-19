import { Editor } from '../core/editor';
import { eventTargetRange } from './utils';

export function handleInsertText(editor: Editor, event: InputEvent): void {
  editor.executeCommand(
    'insert-text',
    {
      range: eventTargetRange(editor.view, event),
      text: event.data || '',
    },
    false
  );
}
