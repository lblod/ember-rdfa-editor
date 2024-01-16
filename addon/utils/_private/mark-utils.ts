import { PNode } from '@lblod/ember-rdfa-editor';
import { Attrs, MarkType, ResolvedPos } from 'prosemirror-model';
import { SelectionRange, Selection } from 'prosemirror-state';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { shallowEqual } from '@lblod/ember-rdfa-editor/utils/_private/object-utils';

/**
 * Check that between 2 positions in a Node the same mark is set. Optionally only consider marks
 * equal if they have the same attributes.
 **/
export function rangeHasMarkEverywhere(
  root: PNode,
  from: number,
  to: number,
  markType: MarkType,
  markAttrs?: Attrs | null,
) {
  let found = false;
  let keepSearching = true;
  if (to > from) {
    root.nodesBetween(from, to, (node) => {
      if (node.isText && keepSearching) {
        const mark = markType.isInSet(node.marks);
        const hasMark =
          !!mark && (!markAttrs || shallowEqual(markAttrs, mark.attrs));
        found = hasMark;
        if (!hasMark) {
          keepSearching = false;
        }
      }
      return keepSearching;
    });
  }
  return found;
}

/**
 * return { from, to } with the positions adjusted so any starting or ending spaces
 * are not part of the range anymore.
 * ### space logic ###
 * if adding marks, do not add it the starting/final spaces,
 * to avoid the mark still applying when typing behind this space.
 * e.g. with text (between * highlighted)= `*ab *some text`, and setting bold
 * we don't want to have the new typed text be bold if putting the cursor between `*s`.
 **/
export function fromToWithoutEdgeSpaces(
  $from: ResolvedPos,
  $to: ResolvedPos,
): { from: number; to: number } {
  let from = $from.pos;
  let to = $to.pos;
  const start = $from.nodeAfter;
  const end = $to.nodeBefore;

  const spaceStart =
    start && start.isText
      ? unwrap(/^\s*/.exec(unwrap(start.text)))[0].length
      : 0;
  const spaceEnd =
    end && end.isText ? unwrap(/\s*$/.exec(unwrap(end.text)))[0].length : 0;
  if (from + spaceStart < to) {
    from += spaceStart;
    to -= spaceEnd;
  }
  return { from, to };
}

/**
 * Check whether a mark is set everywhere within a selection, including in all of the ranges within
 * it. Optionally only consider marks equal if they have the same attributes. Don't check any spaces
 * before and after, as the user can't see whether these contain the mark.
 **/
export function selectionHasMarkEverywhere(
  doc: PNode,
  { ranges }: Selection,
  markType: MarkType,
  attrs?: Attrs,
) {
  // 'has' will remain true only if all of the ranges have the mark everywhere
  let has = true;
  for (let i = 0; has && i < ranges.length; i++) {
    const { $from, $to } = ranges[i];
    const { from, to } = fromToWithoutEdgeSpaces($from, $to);
    has = rangeHasMarkEverywhere(doc, from, to, markType, attrs);
  }
  return has;
}

export function markApplies(
  doc: PNode,
  ranges: readonly SelectionRange[],
  type: MarkType,
) {
  for (let i = 0; i < ranges.length; i++) {
    const { $from, $to } = ranges[i];
    let can =
      $from.depth == 0
        ? doc.inlineContent && doc.type.allowsMarkType(type)
        : false;
    doc.nodesBetween($from.pos, $to.pos, (node) => {
      if (can) {
        return false;
      }
      can = node.inlineContent && node.type.allowsMarkType(type);
      return true;
    });
    if (can) {
      return true;
    }
  }
  return false;
}
