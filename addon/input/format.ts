import { Editor } from '../core/editor';
import { MarkSpec } from '../model/mark';
import { boldMarkSpec } from '../plugins/basic-styles/marks/bold';
import { italicMarkSpec } from '../plugins/basic-styles/marks/italic';
import { strikethroughMarkSpec } from '../plugins/basic-styles/marks/strikethrough';
import { underlineMarkSpec } from '../plugins/basic-styles/marks/underline';

type FontStyle = 'bold' | 'italic' | 'underline' | 'strikethrough';
const fontStyleMap: Map<FontStyle, MarkSpec> = new Map<FontStyle, MarkSpec>([
  ['bold', boldMarkSpec],
  ['italic', italicMarkSpec],
  ['underline', underlineMarkSpec],
  ['strikethrough', strikethroughMarkSpec],
]);

export function handleBasicStyle(style: FontStyle) {
  return function (editor: Editor, event: KeyboardEvent) {
    console.log(event);
    event.preventDefault();
    const selection = editor.state.selection;
    if (selection.hasMark(style)) {
      editor.executeCommand('remove-mark-from-selection', { markName: style });
    } else {
      editor.executeCommand('add-mark-to-selection', { markName: style });
    }
  };
}
