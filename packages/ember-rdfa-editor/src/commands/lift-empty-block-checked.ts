import {
  canSplit,
  specCanSplit,
} from '@lblod/ember-rdfa-editor/commands/split-block-checked.ts';
import type { Command, TextSelection } from 'prosemirror-state';
import { liftTarget } from 'prosemirror-transform';
import {
  isNone,
  unwrap,
} from '@lblod/ember-rdfa-editor/utils/_private/option.ts';

export const liftEmptyBlockChecked: Command = (state, dispatch) => {
  const { $cursor } = state.selection as TextSelection;
  if (!$cursor || $cursor.parent.content.size) {
    return false;
  }
  if ($cursor.depth > 1 && $cursor.after() !== $cursor.end(-1)) {
    const before = $cursor.before();
    if (canSplit(state.doc, before)) {
      if (dispatch) dispatch(state.tr.split(before).scrollIntoView());
      return true;
    }
  }
  const range = $cursor.blockRange();
  if (!range) {
    return false;
  }
  const { $from, depth } = range;

  const target = liftTarget(range);
  if (isNone(target)) {
    return false;
  }
  for (let d = depth; d > target; d--) {
    if (!specCanSplit($from.node(d).type.spec)) {
      return false;
    }
  }
  if (dispatch) {
    dispatch(state.tr.lift(unwrap(range), target).scrollIntoView());
  }
  return true;
};
