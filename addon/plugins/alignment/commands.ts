import { Command } from 'prosemirror-state';
import { AlignmentOption } from '.';

type SetAlignmentArgs = {
  option: AlignmentOption;
};

export function setAlignment({ option }: SetAlignmentArgs): Command {
  return function (state, dispatch) {
    const { selection } = state;
    const applicableNodes: number[] = [];
    for (const { $from, $to } of selection.ranges) {
      state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
        if ('alignment' in node.attrs) {
          applicableNodes.push(pos);
        }
      });
    }

    if (!applicableNodes.length) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      applicableNodes.forEach((pos) => {
        tr.setNodeAttribute(pos, 'alignment', option);
      });
      dispatch(tr);
    }
    return true;
  };
}
