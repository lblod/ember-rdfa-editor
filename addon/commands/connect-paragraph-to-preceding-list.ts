import { Command, EditorState } from 'prosemirror-state';
import { ReplaceAroundStep } from 'prosemirror-transform';
import { ResolvedPos } from 'prosemirror-model';

const isEmptySelectionAtStart = (state: EditorState): boolean => {
  const { empty, $from } = state.selection;

  return empty && $from.parentOffset === 0;
};

const canToJoinToPreviousListItem = (state: EditorState): boolean => {
  const { $from } = state.selection;
  const { bullet_list, ordered_list } = state.schema.nodes;

  const $before = state.doc.resolve($from.pos - 1);
  const nodeBefore = $before ? $before.nodeBefore : null;

  return (
    !!nodeBefore && [bullet_list, ordered_list].indexOf(nodeBefore.type) > -1
  );
};

// taken from
// @link https://github.com/ProseMirror/prosemirror-commands/blob/7d895cae5224ad6d5bd6e705878811673b0314f7/src/commands.ts#LL150C1-L156C2
const findCutBefore = ($pos: ResolvedPos) => {
  // parent is non-isolating, so we can look across this boundary
  if (!$pos.parent.type.spec.isolating) {
    // search up the tree from the pos's *parent*
    for (let i = $pos.depth - 1; i >= 0; i--) {
      // starting from the inner most node's parent, find out
      // if we're not its first child
      if ($pos.index(i) > 0) {
        return $pos.doc.resolve($pos.before(i + 1));
      }
      if ($pos.node(i).type.spec.isolating) {
        break;
      }
    }
  }
  return null;
};

export const connectParagraphToPrecedingList: Command = (state, dispatch) => {
  if (!isEmptySelectionAtStart(state)) return false;
  if (!canToJoinToPreviousListItem(state)) return false;

  const { $from } = state.selection;

  const { paragraph, bullet_list, ordered_list, list_item } =
    state.schema.nodes;

  const $cutPos = $from;

  const $cut = findCutBefore($cutPos);

  if (!$cut) {
    return false;
  }

  // The preceding containing node is a list
  const nodeBeforeIsList =
    $cut.nodeBefore &&
    [bullet_list, ordered_list].indexOf($cut.nodeBefore.type) > -1;

  // The node after is paragraph or list_item
  const nodeAfterIsParagraphOrListItem =
    $cut.nodeAfter && [paragraph, list_item].indexOf($cut.nodeAfter.type) > -1;

  if (nodeBeforeIsList && nodeAfterIsParagraphOrListItem) {
    // find the nearest paragraph that precedes this node
    let $lastNode = $cut.doc.resolve($cut.pos - 1);

    while ($lastNode.parent.type !== paragraph) {
      $lastNode = state.doc.resolve($lastNode.pos - 1);
    }

    let { tr } = state;

    tr = tr.step(
      new ReplaceAroundStep(
        $lastNode.pos,
        $cut.pos + $cut.nodeAfter.nodeSize,
        $cut.pos + 1,
        $cut.pos + $cut.nodeAfter.nodeSize - 1,
        state.tr.doc.slice($lastNode.pos, $cut.pos),
        0,
        true
      )
    );

    // find out if there's now another list following and join them
    // as in, [list, p, list] => [list with p, list], and we want [joined list]
    const $postCut = tr.doc.resolve(
      tr.mapping.map($cut.pos + $cut.nodeAfter.nodeSize)
    );

    if (
      $postCut.nodeBefore &&
      $postCut.nodeAfter &&
      $postCut.nodeBefore.type === $postCut.nodeAfter.type &&
      [bullet_list, ordered_list].indexOf($postCut.nodeBefore.type) > -1
    ) {
      tr = tr.join($postCut.pos);
    }

    if (dispatch) {
      dispatch(tr);
    }

    return true;
  }

  return false;
};
