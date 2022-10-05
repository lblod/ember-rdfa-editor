import Controller from '../core/controllers/controller';
import ModelRange from '../core/model/model-range';
import handleEscape from './escape';
import { handleBasicStyle } from './format';
import handleTab from './tab';

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
  | 'Tab'
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
export type KeyHandler = (controller: Controller, event: KeyboardEvent) => void;
/**
 * A map of keycodes to their handlers.
 * Keycodes follow https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
 * With the exception of "space", which is represented by 'Space' instead of ' ' for readability reasons
 * */
export type KeyMap = Partial<Record<KeyCode, KeyHandler>>;

export const defaultKeyMap: KeyMap = {
  ArrowLeft: moveCursor(-1),
  ArrowRight: moveCursor(1),
  Escape: handleEscape(),
  Tab: handleTab(1),
  'S-Tab': handleTab(-1),
  'C-b': handleBasicStyle('bold'),
  'C-i': handleBasicStyle('italic'),
  'C-u': handleBasicStyle('underline'),
};

/**
 * Parse a @link{KeyboardEvent} into a string that can be used to index a @link{KeyMap}
 * */
export function mapKeyEvent(
  controller: Controller,
  event: KeyboardEvent
): void {
  const keymap = controller.currentState.keymap;
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
    handler(controller, event);
  }
}

function moveCursor(steps: number) {
  return function (controller: Controller, event: KeyboardEvent) {
    const range = controller.selection.lastRange;
    if (!range) {
      return;
    }
    if (range.collapsed) {
      event.preventDefault();
      const start = range.start;
      const newPosition = start.shiftedVisually(steps);
      const resultRange = new ModelRange(newPosition);
      const tr = controller.createTransaction();
      tr.selectRange(resultRange);
      controller.view.stateOnlyDispatch(tr);
      // controller.dispatchTransaction(tr);
    }
  };
}
