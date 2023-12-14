import { Command } from 'prosemirror-state';
import { PNode } from '..';

type IndentNodeArgs = {
  direction: number;
  predicate?: (node: PNode, pos: number, parent: PNode | null) => boolean;
  maxLevel?: number;
};

/**
 * Returns a command to indent the node(s) in the selection.
 * Only nodes with `indentationLevel` as node attribute can be indented.
 * @direction the number -1 or 1 to indent back or further
 * @predicate extra check to see if a node should be allowed to indent
 * @maxLevel max level to indent
 * @returns Command
 */
export function indentNode({
  direction,
  predicate = () => true,
  maxLevel = 4,
}: IndentNodeArgs): Command {
  return function (state, dispatch) {
    const { from, to } = state.selection;
    const applicableNodes: { node: PNode; pos: number }[] = [];
    state.doc.nodesBetween(from, to, (node, pos, parent) => {
      if (
        'indentationLevel' in node.attrs &&
        predicate(node, pos, parent) &&
        ((direction === -1 && node.attrs.indentationLevel > 0) ||
          (direction === 1 && node.attrs.indentationLevel < maxLevel))
      ) {
        applicableNodes.push({ node, pos });
      }
    });
    if (!applicableNodes.length) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      applicableNodes.forEach(({ node, pos }) => {
        const indentationLevel = node.attrs.indentationLevel as number;
        tr.setNodeAttribute(
          pos,
          'indentationLevel',
          indentationLevel + direction,
        );
      });
      dispatch(tr);
    }
    return true;
  };
}
