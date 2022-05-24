import { Editor } from '../core/editor';
import { MarkSet, MarkSpec } from '../model/mark';
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
export function handleBasicStyle(
  editor: Editor,
  event: InputEvent,
  style: FontStyle
) {
  console.log(event);
  event.preventDefault();
  editor.executeCommand('add-mark-to-selection', { markName: style });
}
