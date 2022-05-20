import { Editor } from '../core/editor';
import { eventTargetRange } from './utils';

export function handleInsertText(editor: Editor, event: InputEvent): void {
  editor.executeCommand(
    'insert-text',
    {
      range: eventTargetRange(editor.state, editor.view.domRoot, event),
      text: event.data || '',
    },
    false
  );
}
