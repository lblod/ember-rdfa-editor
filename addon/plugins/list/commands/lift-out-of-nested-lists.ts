/**
 * Based on https://github.com/ProseMirror/prosemirror-schema-list
 *
 * Includes modified liftToOuterList and liftOutOfList methods. liftOutOfList has been renamed
 * to liftOutOfCurrentList. The modified methods no longer dispatch their modifications.
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
 */

import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { mapPositionFrom } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Fragment, NodeRange, NodeType, Slice } from 'prosemirror-model';
import type { Command, Transaction } from 'prosemirror-state';
import { canJoin, liftTarget, ReplaceAroundStep } from 'prosemirror-transform';

export function liftOutOfNestedLists(itemType: NodeType): Command {
  return function (state, dispatch) {
    let { $from, $to } = state.selection;
    let range = $from.blockRange(
      $to,
      (node) =>
        node.childCount > 0 && unwrap(node.firstChild).type === itemType,
    );
    if (!range) return false;
    if (dispatch) {
      const tr = state.tr;
      while (range) {
        if ($from.node(range.depth - 1).type === itemType) {
          const result = liftToOuterList(tr, itemType, range);
          if (!result) {
            break;
          }
        } else {
          const result = liftOutOfCurrentList(tr, range);
          if (!result) {
            break;
          }
        }
        $from = tr.selection.$from;
        $to = tr.selection.$to;
        range = $from.blockRange(
          $to,
          (node) =>
            node.childCount > 0 && unwrap(node.firstChild).type === itemType,
        );
      }
      dispatch(tr);
    }
    return true;
  };
}

function liftToOuterList(
  tr: Transaction,
  itemType: NodeType,
  range: NodeRange,
) {
  const trLength = tr.mapping.maps.length;
  const end = range.end,
    endOfList = range.$to.end(range.depth);
  if (end < endOfList) {
    // There are siblings after the lifted items, which must become
    // children of the last item
    tr.step(
      new ReplaceAroundStep(
        end - 1,
        endOfList,
        end,
        endOfList,
        new Slice(
          Fragment.from(itemType.create(null, range.parent.copy())),
          1,
          0,
        ),
        1,
        true,
      ),
    );
    range = new NodeRange(
      tr.doc.resolve(range.$from.pos),
      tr.doc.resolve(endOfList),
      range.depth,
    );
  }
  const target = liftTarget(range);
  if (target == null) return false;
  tr.lift(range, target);
  const after = mapPositionFrom(end, tr.mapping, trLength, -1) - 1;
  if (canJoin(tr.doc, after)) tr.join(after);
  return true;
}

function liftOutOfCurrentList(tr: Transaction, range: NodeRange) {
  const trLength = tr.mapping.maps.length;
  const list = range.parent;
  // Merge the list items into a single big item
  for (
    let pos = range.end, i = range.endIndex - 1, e = range.startIndex;
    i > e;
    i--
  ) {
    pos -= list.child(i).nodeSize;
    tr.delete(pos - 1, pos + 1);
  }
  const $start = tr.doc.resolve(range.start),
    item = unwrap($start.nodeAfter);
  if (
    mapPositionFrom(range.end, tr.mapping, trLength) !=
    range.start + unwrap($start.nodeAfter).nodeSize
  )
    return false;
  const atStart = range.startIndex == 0,
    atEnd = range.endIndex == list.childCount;
  const parent = $start.node(-1),
    indexBefore = $start.index(-1);
  if (
    !parent.canReplace(
      indexBefore + (atStart ? 0 : 1),
      indexBefore + 1,
      item.content.append(atEnd ? Fragment.empty : Fragment.from(list)),
    )
  )
    return false;
  const start = $start.pos,
    end = start + item.nodeSize;
  // Strip off the surrounding list. At the sides where we're not at
  // the end of the list, the existing list is closed. At sides where
  // this is the end, it is overwritten to its end.
  tr.step(
    new ReplaceAroundStep(
      start - (atStart ? 1 : 0),
      end + (atEnd ? 1 : 0),
      start + 1,
      end - 1,
      new Slice(
        (atStart
          ? Fragment.empty
          : Fragment.from(list.copy(Fragment.empty))
        ).append(
          atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty)),
        ),
        atStart ? 0 : 1,
        atEnd ? 0 : 1,
      ),
      atStart ? 0 : 1,
    ),
  );
  return true;
}
