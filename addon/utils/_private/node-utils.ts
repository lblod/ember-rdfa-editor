/**
 * Contains code from the `prosemirror-view` package
 *
 * Copyright (C) 2015-2017 by Marijn Haverbeke <marijn@haverbeke.berlin> and others
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

import { Fragment, PNode, Slice } from '@lblod/ember-rdfa-editor';
import { unwrap } from './option';

export function getGroups(node: PNode) {
  return node.type.spec.group?.split(' ') ?? [];
}

export function hasGroups(node: PNode, ...groups: string[]) {
  const nodeGroups = getGroups(node);
  return groups.every((group) => nodeGroups.includes(group));
}

/**
 * Adapted from https://github.com/ProseMirror/prosemirror-view/blob/39fb7c2e71287d6ac2013f5a8c878873a074244e/src/clipboard.ts#L169
 */
function closeRange(
  fragment: Fragment,
  side: number,
  from: number,
  to: number,
  depth: number,
  openEnd: number,
) {
  const node =
    side < 0 ? unwrap(fragment.firstChild) : unwrap(fragment.lastChild);
  let inner = node.content;
  if (fragment.childCount > 1) openEnd = 0;
  if (depth < to - 1)
    inner = closeRange(inner, side, from, to, depth + 1, openEnd);
  if (depth >= from)
    inner =
      side < 0
        ? unwrap(
            node.contentMatchAt(0).fillBefore(inner, openEnd <= depth),
          ).append(inner)
        : inner.append(
            unwrap(
              node
                .contentMatchAt(node.childCount)
                .fillBefore(Fragment.empty, true),
            ),
          );
  return fragment.replaceChild(
    side < 0 ? 0 : fragment.childCount - 1,
    node.copy(inner),
  );
}

/**
 * Adapted from https://github.com/ProseMirror/prosemirror-view/blob/39fb7c2e71287d6ac2013f5a8c878873a074244e/src/clipboard.ts#L179
 */
export function closeSlice(slice: Slice, openStart: number, openEnd: number) {
  if (openStart < slice.openStart)
    slice = new Slice(
      closeRange(
        slice.content,
        -1,
        openStart,
        slice.openStart,
        0,
        slice.openEnd,
      ),
      openStart,
      slice.openEnd,
    );
  if (openEnd < slice.openEnd)
    slice = new Slice(
      closeRange(slice.content, 1, openEnd, slice.openEnd, 0, 0),
      slice.openStart,
      openEnd,
    );
  return slice;
}
