import { NodeType } from 'prosemirror-model';
import { Command } from 'prosemirror-state';
import { PNode } from '..';

type IndentNodeArgs = {
  types: NodeType[];
  direction: number;
  predicate?: (node: PNode, pos: number, parent: PNode | null) => boolean;
  maxLevel?: number;
};

export function indentNode({
  types,
  direction,
  predicate = () => true,
  maxLevel = 4,
}: IndentNodeArgs): Command {
  return function (state, dispatch) {
    const { from, to } = state.selection;
    const applicableNodes: { node: PNode; pos: number }[] = [];
    state.doc.nodesBetween(from, to, (node, pos, parent) => {
      if (
        types.includes(node.type) &&
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
