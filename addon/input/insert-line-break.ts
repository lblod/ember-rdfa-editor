import { Editor } from '../core/editor';

export function handleInsertLineBreak(editor: Editor, event: InputEvent): void {
  event.preventDefault();
  editor.executeCommand('insert-newLine', {}, true);
}
