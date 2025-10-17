import { PNode } from '#root/prosemirror-aliases.ts';
import { Transaction, Selection } from 'prosemirror-state';
import { changedDescendants } from '#root/utils/_private/changed-descendants.ts';
import type { ListPathEntry } from '../nodes/list-nodes.ts';
import {
  IS_ON_CHANGED,
  type NodeSpecOnChanged,
} from '../../on-changed/plugin.ts';

export const onChanged: NodeSpecOnChanged = {
  doOnce: true,
  monadGenerator: (_transactions, oldState, newState) => {
    const changedLists: { node: PNode; pos: number }[] = [];
    changedDescendants(
      oldState.doc,
      newState.doc,
      0,
      (node: PNode, pos: number) => {
        if (
          node.type.spec.group?.includes('list') &&
          (changedLists.length === 0 ||
            pos >
              changedLists[changedLists.length - 1].pos +
                changedLists[changedLists.length - 1].node.nodeSize)
        ) {
          changedLists.push({ node, pos });
          return false;
        }
        return true;
      },
    );
    if (changedLists.length) {
      return [
        (state) => {
          const tr = state.tr;
          const oldSelection = tr.selection;
          for (const { node, pos } of changedLists) {
            calculateListTree(node, pos, tr);
          }
          console.log(tr);
          // A bit of a hack: we want to make sure to preserve the old selection, this allows us to easily copy it
          const newSelection = Selection.fromJSON(
            tr.doc,
            oldSelection.toJSON(),
          );
          tr.setSelection(newSelection);
          return { transaction: tr, result: true, initialState: newState };
        },
      ];
    } else {
      return [];
    }
  },
};

function calculateListTree(node: PNode, offset: number, tr: Transaction) {
  const path: ListPathEntry[] = [];
  updateListItems(
    node,
    path,
    offset,
    tr,
    (node.attrs['style'] as string) ?? 'unordered',
    (node.attrs['hierarchical'] as boolean) ?? false,
  );
}
function updateListItems(
  node: PNode,
  path: ListPathEntry[],
  docPosOffset: number,
  tr: Transaction,
  style: string,
  hierarchical: boolean,
) {
  if (node.isLeaf) {
    return;
  }
  let counter = 0;
  node.content.forEach((child: PNode, offset: number) => {
    if (child.type.name === 'list_item') {
      const newPath = [...path, { pos: counter, hierarchical, style }];
      tr.setNodeAttribute(docPosOffset + offset + 1, 'listPath', newPath);
      // We set the meta of the on changed plugin so it gets ignored there and doesn't enter an infinite loop
      // TODO: migrate this whole plugin to an onChangged attribute
      tr.setMeta(IS_ON_CHANGED, true);
      updateListItems(
        child,
        newPath,
        docPosOffset + offset + 1,
        tr,
        style,
        hierarchical,
      );
      counter++;
    } else if (
      child.type.name === 'ordered_list' ||
      child.type.name === 'bullet_list'
    ) {
      updateListItems(
        child,
        path,
        docPosOffset + offset + 1,
        tr,
        (child.attrs['style'] as string) ?? style,
        (child.attrs['hierarchical'] as boolean) ?? hierarchical,
      );
    } else {
      updateListItems(
        child,
        path,
        docPosOffset + offset + 1,
        tr,
        style,
        hierarchical,
      );
    }
  });
}
