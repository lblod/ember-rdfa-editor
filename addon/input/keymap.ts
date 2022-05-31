import { Editor } from '../core/editor';
import ModelRange from '../model/model-range';
type Modifier = 'C' | 'M' | 'S' | 'A';

type Alphabet =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';
// see https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
// except for 'Space'
type Key =
  | Alphabet
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Space'
  | 'Delete'
  | 'Backspace'
  | 'Escape';
type ModifierCode =
  | `${Modifier}`
  | `${Modifier}-${Modifier}`
  | `${Modifier}-${Modifier}-${Modifier}`;

export type KeyCode = `${ModifierCode}-${Key}` | `${Key}`;
export type KeyHandler = (editor: Editor, event: KeyboardEvent) => void;
export type KeyMap = Partial<Record<KeyCode, KeyHandler>>;

export const defaultKeyMap: KeyMap = {
  ArrowLeft: moveCursor(-1),
  ArrowRight: moveCursor(1),
};

export function mapKeyEvent(editor: Editor, event: KeyboardEvent): void {
  const keymap = editor.state.keymap;
  if (event.isComposing) {
    return;
  }
  let codestr = '';
  if (event.ctrlKey) {
    codestr += 'C-';
  }
  if (event.altKey) {
    codestr += 'A-';
  }
  if (event.shiftKey) {
    codestr += 'S-';
  }

  if (event.metaKey) {
    codestr += 'M-';
  }
  codestr += event.key === ' ' ? 'Space' : event.key;
  const handler = keymap[codestr as KeyCode];
  if (handler) {
    handler(editor, event);
  }
}
function moveCursor(steps: number) {
  return function (editor: Editor, event: KeyboardEvent) {
    const selection = editor.state.selection;
    const start = selection.ranges[0].start;
    const end = selection.lastRange?.end;
    if (end && start.sameAs(end)) {
      const newPosition = start.shiftedVisually(steps);
      const range = new ModelRange(newPosition);
      const tr = editor.state.createTransaction();
      tr.selectRange(range);
      event.preventDefault();
      editor.dispatchTransaction(tr);
    }
  };
}
