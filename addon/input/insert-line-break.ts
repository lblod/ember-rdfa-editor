import { Editor } from '../core/editor';
import { eventTargetRange } from './utils';

export function handleInsertLineBreak(editor: Editor, event: InputEvent): void {
  event.preventDefault();
  editor.executeCommand('insert-newLine', {
    range: eventTargetRange(editor.view, event),
  });
}
