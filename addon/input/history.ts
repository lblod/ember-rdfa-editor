import { Editor } from '../core/editor';

export function handleUndo(editor: Editor, event: InputEvent) {
  event.preventDefault();
  editor.executeCommand('undo', {}, true);
}
