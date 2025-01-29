/**
 * Adapted from https://github.com/ProseMirror/prosemirror-commands with support for selecting atomic inline nodes
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
 */

import { ResolvedPos } from 'prosemirror-model';
import { type Command, NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

/// deletion at the selected point.
export const selectNodeBackward: Command = (state, dispatch, view) => {
  const { $head, empty } = state.selection;
  let $cut: ResolvedPos | null = $head;
  if (!empty) return false;

  if ($head.parent.isTextblock && isAtStartOfTextBlock($head, view)) {
    $cut = findCutBefore($head);
  }
  if (!$cut) {
    return false;
  }
  const node = $cut.nodeBefore;
  if (!node || !NodeSelection.isSelectable(node)) return false;
  if (dispatch)
    dispatch(
      state.tr
        .setSelection(NodeSelection.create(state.doc, $cut.pos - node.nodeSize))
        .scrollIntoView(),
    );
  return true;
};

function findCutBefore($pos: ResolvedPos): ResolvedPos | null {
  if (!$pos.parent.type.spec.isolating)
    for (let i = $pos.depth - 1; i >= 0; i--) {
      if ($pos.index(i) > 0) return $pos.doc.resolve($pos.before(i + 1));
      if ($pos.node(i).type.spec.isolating) break;
    }
  return null;
}

function isAtStartOfTextBlock($pos: ResolvedPos, view?: EditorView) {
  return view
    ? view.endOfTextblock('backward', view.state)
    : $pos.parentOffset === 0;
}
