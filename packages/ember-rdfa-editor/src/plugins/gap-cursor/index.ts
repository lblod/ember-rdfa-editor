import { keydownHandler } from 'prosemirror-keymap';
import {
  TextSelection,
  Plugin,
  type Command,
  EditorState,
} from 'prosemirror-state';
import { Fragment, ResolvedPos, Slice } from 'prosemirror-model';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { GapCursor } from './gap-cursor.ts';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option.ts';

/**
 *
 * Modified `gapCursor` plugin based on https://github.com/ProseMirror/prosemirror-gapcursor
 *
 * - Replaces the 'click' handler by a 'mousedown' handler in order to be able to intercept the mouse-event earlier
 * - Includes changes on the 'click' handler in order to correct the output provided by the `view.posAtCoords` method
 *
 * Copyright (C) 2015-2017 by Marijn Haverbeke <marijn@haverbeke.berlin> and others
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *  */
export function gapCursor(): Plugin {
  return new Plugin({
    props: {
      decorations: drawGapCursor,

      createSelectionBetween(_view, $anchor, $head) {
        return $anchor.pos == $head.pos && GapCursor.valid($head)
          ? new GapCursor($head)
          : null;
      },

      handleKeyDown,
      handleDOMEvents: {
        beforeinput,
        mousedown,
      },
    },
  });
}

export { GapCursor };

const handleKeyDown = keydownHandler({
  ArrowLeft: arrow('horiz', -1),
  ArrowRight: arrow('horiz', 1),
  ArrowUp: arrow('vert', -1),
  ArrowDown: arrow('vert', 1),
});

function arrow(axis: 'vert' | 'horiz', dir: number): Command {
  const dirStr =
    axis == 'vert' ? (dir > 0 ? 'down' : 'up') : dir > 0 ? 'right' : 'left';
  return function (state, dispatch, view) {
    const sel = state.selection;
    let $start = dir > 0 ? sel.$to : sel.$from,
      mustMove = sel.empty;
    if (sel instanceof TextSelection) {
      if (!unwrap(view).endOfTextblock(dirStr) || $start.depth == 0)
        return false;
      mustMove = false;
      $start = state.doc.resolve(dir > 0 ? $start.after() : $start.before());
    }
    const found = GapCursor.findGapCursorFrom($start, dir, mustMove);
    if (!found) return false;
    if (dispatch) dispatch(state.tr.setSelection(found));
    return true;
  };
}

function mousedown(view: EditorView, event: MouseEvent) {
  // Only handle the event in the main mouse button is pressed
  if (event.button !== 0) {
    return false;
  }
  const clickPos = view.posAtCoords({
    left: event.clientX,
    top: event.clientY,
  });
  if (!clickPos) return false;
  if (!view || !view.editable) return false;
  const $pos = resolvePosition(view, clickPos);

  if (!GapCursor.valid($pos)) return false;
  event.preventDefault();
  view.dispatch(view.state.tr.setSelection(new GapCursor($pos)));
  view.focus();
  return true;
}

/**
 * Helper function which takes in the result of `view.posAtCoords` and returns a resolved-position in the current document.
 * If the provided `pos` is not a direct child of the node at `inside`, this function tries to find a valid position that is a direct child of `inside`.
 */
function resolvePosition(
  view: EditorView,
  { pos, inside }: { pos: number; inside: number },
): ResolvedPos {
  let result = view.state.doc.resolve(pos);
  const parent = inside === -1 ? view.state.doc : view.state.doc.nodeAt(inside);
  if (parent?.isAtom) {
    return result;
  }
  while (result.depth > 0 && result.parent !== parent) {
    if (result.index() <= 0) {
      result = view.state.doc.resolve(result.before());
    } else if (result.index() >= result.parent.childCount - 1) {
      result = view.state.doc.resolve(result.after());
    } else {
      break;
    }
  }
  return result;
}

// This is a hack that, when a composition starts while a gap cursor
// is active, quickly creates an inline context for the composition to
// happen in, to avoid it being aborted by the DOM selection being
// moved into a valid position.
function beforeinput(view: EditorView, event: InputEvent) {
  if (
    event.inputType != 'insertCompositionText' ||
    !(view.state.selection instanceof GapCursor)
  )
    return false;

  const { $from } = view.state.selection;
  const insert = $from.parent
    .contentMatchAt($from.index())
    .findWrapping(view.state.schema.nodes['text']);
  if (!insert) return false;

  let frag = Fragment.empty;
  for (let i = insert.length - 1; i >= 0; i--)
    frag = Fragment.from(insert[i].createAndFill(null, frag));
  const tr = view.state.tr.replace($from.pos, $from.pos, new Slice(frag, 0, 0));
  tr.setSelection(TextSelection.near(tr.doc.resolve($from.pos + 1)));
  view.dispatch(tr);
  return false;
}

function drawGapCursor(state: EditorState) {
  if (!(state.selection instanceof GapCursor)) return null;
  const node = document.createElement('div');
  node.className = 'ProseMirror-gapcursor';
  return DecorationSet.create(state.doc, [
    Decoration.widget(state.selection.head, node, { key: 'gapcursor' }),
  ]);
}
