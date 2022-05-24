import { Editor } from '../core/editor';
import { eventTargetRange } from './utils';

export function handleInsertLineBreak(editor: Editor, event: InputEvent): void {
  event.preventDefault();
  editor.executeCommand('insert-newLine', {}, true);
}

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
export function handleInsertListItem(
  editor: Editor,
  event: InputEvent,
  listType: 'ul' | 'ol'
) {
  event.preventDefault();
  editor.executeCommand(
    'insert-newLi',
    {
      range: eventTargetRange(editor.state, editor.view.domRoot, event),
    },
    true
  );
}
