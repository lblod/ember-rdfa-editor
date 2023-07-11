/**
 *
 * Modified from https://github.com/ProseMirror/prosemirror-transform and https://github.com/ProseMirror/prosemirror-commands
 * This modified version of the setBlockType command allows for the option to preserve the existing attributes of the nodes
 * 
 * Copyright (C) 2015-2017 by Marijn Haverbeke <marijnh@gmail.com> and others

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { Attrs, Fragment, NodeType, Slice } from 'prosemirror-model';
import { Command } from 'prosemirror-state';
import { ReplaceAroundStep, Transform } from 'prosemirror-transform';
import { PNode } from '..';

/// Returns a command that tries to set the selected textblocks to the
/// given node type with the given attributes.
export function setBlockType(
  nodeType: NodeType,
  attrs: Attrs | null = null,
  keepAttrs = false,
): Command {
  return function (state, dispatch) {
    let applicable = false;
    for (let i = 0; i < state.selection.ranges.length && !applicable; i++) {
      const {
        $from: { pos: from },
        $to: { pos: to },
      } = state.selection.ranges[i];
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (applicable) return false;
        if (!node.isTextblock || node.hasMarkup(nodeType, attrs)) return;
        if (node.type == nodeType) {
          applicable = true;
          return;
        } else {
          const $pos = state.doc.resolve(pos),
            index = $pos.index();
          applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);
          return;
        }
      });
    }
    if (!applicable) return false;
    if (dispatch) {
      const tr = state.tr;
      for (let i = 0; i < state.selection.ranges.length; i++) {
        const {
          $from: { pos: from },
          $to: { pos: to },
        } = state.selection.ranges[i];
        _setBlockType(tr, from, to, nodeType, attrs, keepAttrs);
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

function _setBlockType(
  tr: Transform,
  from: number,
  to: number,
  type: NodeType,
  attrs: Attrs | null,
  keepAttrs = false,
) {
  if (!type.isTextblock)
    throw new RangeError('Type given to setBlockType should be a textblock');
  const mapFrom = tr.steps.length;
  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (
      node.isTextblock &&
      !node.hasMarkup(type, attrs) &&
      canChangeType(tr.doc, tr.mapping.slice(mapFrom).map(pos), type)
    ) {
      // Modified compared to the ProseMirror implementation: we determine whether we need to keep the old attrs of the node or not.
      const newAttrs = keepAttrs ? { ...node.attrs, ...attrs } : attrs;
      // Ensure all markup that isn't allowed in the new node type is cleared
      tr.clearIncompatible(tr.mapping.slice(mapFrom).map(pos, 1), type);
      const mapping = tr.mapping.slice(mapFrom);
      const startM = mapping.map(pos, 1),
        endM = mapping.map(pos + node.nodeSize, 1);
      tr.step(
        new ReplaceAroundStep(
          startM,
          endM,
          startM + 1,
          endM - 1,
          new Slice(
            Fragment.from(type.create(newAttrs, null, node.marks)),
            0,
            0,
          ),
          1,
          true,
        ),
      );
      return false;
    }
    return;
  });
}

function canChangeType(doc: PNode, pos: number, type: NodeType) {
  const $pos = doc.resolve(pos),
    index = $pos.index();
  return $pos.parent.canReplaceWith(index, index + 1, type);
}
