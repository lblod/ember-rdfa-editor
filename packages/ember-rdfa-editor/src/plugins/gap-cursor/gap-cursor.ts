/**
 * Based on code from https://github.com/ProseMirror/prosemirror-gapcursor
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
import { Selection, NodeSelection } from 'prosemirror-state';
import { Slice, ResolvedPos, Node } from 'prosemirror-model';
import type { Mappable } from 'prosemirror-transform';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option.ts';

/// Gap cursor selections are represented using this class. Its
/// `$anchor` and `$head` properties both point at the cursor position.
export class GapCursor extends Selection {
  visible = false;
  /// Create a gap cursor.
  constructor($pos: ResolvedPos) {
    super($pos, $pos);
  }

  map(doc: Node, mapping: Mappable): Selection {
    const $pos = doc.resolve(mapping.map(this.head));
    return GapCursor.valid($pos) ? new GapCursor($pos) : Selection.near($pos);
  }

  content() {
    return Slice.empty;
  }

  eq(other: Selection): boolean {
    return other instanceof GapCursor && other.head == this.head;
  }

  toJSON(): unknown {
    return { type: 'gapcursor', pos: this.head };
  }

  /// @internal
  static fromJSON(doc: Node, json: { pos: unknown }): GapCursor {
    if (typeof json.pos != 'number')
      throw new RangeError('Invalid input for GapCursor.fromJSON');
    return new GapCursor(doc.resolve(json.pos));
  }

  /// @internal
  getBookmark() {
    return new GapBookmark(this.anchor);
  }

  /// @internal
  static valid($pos: ResolvedPos) {
    const parent = $pos.parent;
    if (parent.isTextblock || !closedBefore($pos) || !closedAfter($pos))
      return false;
    const override = parent.type.spec['allowGapCursor'] as boolean | null;
    if (override != null) return override;
    const deflt = parent.contentMatchAt($pos.index()).defaultType;
    return deflt && deflt.isTextblock;
  }

  /// @internal
  static findGapCursorFrom(
    this: void,
    $pos: ResolvedPos,
    dir: number,
    mustMove = false,
  ) {
    search: for (;;) {
      if (!mustMove && GapCursor.valid($pos)) return new GapCursor($pos);
      let pos = $pos.pos,
        next = null;
      // Scan up from this position
      for (let d = $pos.depth; ; d--) {
        const parent = $pos.node(d);
        if (
          dir > 0 ? $pos.indexAfter(d) < parent.childCount : $pos.index(d) > 0
        ) {
          next = parent.child(dir > 0 ? $pos.indexAfter(d) : $pos.index(d) - 1);
          break;
        } else if (d == 0) {
          return null;
        }
        pos += dir;
        const $cur = $pos.doc.resolve(pos);
        if (GapCursor.valid($cur)) return new GapCursor($cur);
      }

      // And then down into the next node
      for (;;) {
        const inside: Node | null = dir > 0 ? next.firstChild : next.lastChild;
        if (!inside) {
          if (
            next.isAtom &&
            !next.isText &&
            !NodeSelection.isSelectable(next)
          ) {
            $pos = $pos.doc.resolve(pos + next.nodeSize * dir);
            mustMove = false;
            continue search;
          }
          break;
        }
        next = inside;
        pos += dir;
        const $cur = $pos.doc.resolve(pos);
        if (GapCursor.valid($cur)) return new GapCursor($cur);
      }

      return null;
    }
  }

  static findFrom = this.findGapCursorFrom;
}

Selection.jsonID('gapcursor', GapCursor);

class GapBookmark {
  constructor(readonly pos: number) {}

  map(mapping: Mappable) {
    return new GapBookmark(mapping.map(this.pos));
  }
  resolve(doc: Node) {
    const $pos = doc.resolve(this.pos);
    return GapCursor.valid($pos) ? new GapCursor($pos) : Selection.near($pos);
  }
}

function closedBefore($pos: ResolvedPos) {
  for (let d = $pos.depth; d >= 0; d--) {
    const index = $pos.index(d),
      parent = $pos.node(d);
    // At the start of this parent, look at next one
    if (index == 0) {
      if (parent.type.spec.isolating) return true;
      continue;
    }
    // See if the node before (or its first ancestor) is closed
    for (
      let before = parent.child(index - 1);
      ;
      before = unwrap(before.lastChild)
    ) {
      if (
        (before.childCount == 0 && !before.inlineContent) ||
        before.isAtom ||
        before.type.spec.isolating
      )
        return true;
      if (before.inlineContent) return false;
    }
  }
  // Hit start of document
  return true;
}

function closedAfter($pos: ResolvedPos) {
  for (let d = $pos.depth; d >= 0; d--) {
    const index = $pos.indexAfter(d),
      parent = $pos.node(d);
    if (index == parent.childCount) {
      if (parent.type.spec.isolating) return true;
      continue;
    }
    for (let after = parent.child(index); ; after = unwrap(after.firstChild)) {
      if (
        (after.childCount == 0 && !after.inlineContent) ||
        after.isAtom ||
        after.type.spec.isolating
      )
        return true;
      if (after.inlineContent) return false;
    }
  }
  return true;
}
