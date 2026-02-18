/**
 *
 * Modified from https://github.com/ProseMirror/prosemirror-tables
 *
 * Copyright (C) 2015-2016 by Marijn Haverbeke <marijnh@gmail.com> and others
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
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import { ResolvedPos } from 'prosemirror-model';
import { NodeSelection } from 'prosemirror-state';
import { unwrap } from '#root/utils/_private/option.ts';
import {
  cellAround,
  type CellSelection,
  type Direction,
} from '@say-editor/prosemirror-tables';

export function findNextCell(
  $cell: ResolvedPos,
  dir: Direction,
): number | null {
  if (dir < 0) {
    const before = $cell.nodeBefore;
    if (before) return $cell.pos - before.nodeSize;
    for (
      let row = $cell.index(-1) - 1, rowEnd = $cell.before();
      row >= 0;
      row--
    ) {
      const rowNode = $cell.node(-1).child(row);
      const lastChild = rowNode.lastChild;
      if (lastChild) {
        return rowEnd - 1 - lastChild.nodeSize;
      }
      rowEnd -= rowNode.nodeSize;
    }
  } else {
    if ($cell.index() < $cell.parent.childCount - 1) {
      return $cell.pos + unwrap($cell.nodeAfter).nodeSize;
    }
    const table = $cell.node(-1);
    for (
      let row = $cell.indexAfter(-1), rowStart = $cell.after();
      row < table.childCount;
      row++
    ) {
      const rowNode = table.child(row);
      if (rowNode.childCount) return rowStart + 1;
      rowStart += rowNode.nodeSize;
    }
  }
  return null;
}

export function selectionCell(sel: CellSelection | NodeSelection): ResolvedPos {
  if ('$anchorCell' in sel && sel.$anchorCell) {
    return sel.$anchorCell.pos > sel.$headCell.pos
      ? sel.$anchorCell
      : sel.$headCell;
  } else if (
    'node' in sel &&
    sel.node &&
    sel.node.type.spec['tableRole'] == 'cell'
  ) {
    return sel.$anchor;
  }
  const $cell = cellAround(sel.$head) || cellNear(sel.$head);
  if ($cell) {
    return $cell;
  }
  throw new RangeError(`No cell found around position ${sel.head}`);
}

function cellNear($pos: ResolvedPos): ResolvedPos | undefined {
  for (
    let after = $pos.nodeAfter, pos = $pos.pos;
    after;
    after = after.firstChild, pos++
  ) {
    const role = after.type.spec['tableRole'] as string;
    if (role == 'cell' || role == 'header_cell') return $pos.doc.resolve(pos);
  }
  for (
    let before = $pos.nodeBefore, pos = $pos.pos;
    before;
    before = before.lastChild, pos--
  ) {
    const role = before.type.spec['tableRole'] as string;
    if (role == 'cell' || role == 'header_cell')
      return $pos.doc.resolve(pos - before.nodeSize);
  }
  return;
}
