import {
  canSplit,
  specCanSplit,
} from '#root/commands/split-block-checked';
import type { Command, TextSelection } from 'prosemirror-state';
import { liftTarget } from 'prosemirror-transform';
import { isNone, unwrap } from '#root/utils/_private/option';

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
