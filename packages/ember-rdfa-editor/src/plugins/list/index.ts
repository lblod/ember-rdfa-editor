import {
  PNode,
  ProsePlugin,
} from '@lblod/ember-rdfa-editor/prosemirror-aliases.ts';
import { EditorState, Transaction, Selection } from 'prosemirror-state';
import { changedDescendants } from '@lblod/ember-rdfa-editor/utils/_private/changed-descendants.ts';
import type { ListPathEntry } from './nodes/list-nodes.ts';

export { toggleList } from './commands/toggle-list.ts';
export { liftOutOfNestedLists } from './commands/lift-out-of-nested-lists.ts';
export {
  orderedListWithConfig,
  listItemWithConfig,
  bulletListWithConfig,
  ordered_list,
  list_item,
  bullet_list,
} from './nodes/list-nodes.ts';
export type { OrderListStyle } from './nodes/list-nodes.ts';
export {
  bullet_list_input_rule,
  ordered_list_input_rule,
} from './input_rules/index.ts';

export function listTrackingPlugin(): ProsePlugin {
  return new ProsePlugin({
    appendTransaction(
      transactions: readonly Transaction[],
      oldState: EditorState,
      newState: EditorState,
    ) {
      if (transactions.some((tr) => tr.docChanged)) {
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
          const tr = newState.tr;
          const oldSelection = tr.selection;
          for (const { node, pos } of changedLists) {
            calculateListTree(node, pos, tr);
          }
          // A bit of a hack: we want to make sure to preserve the old selection, this allows us to easily copy it
          const newSelection = Selection.fromJSON(
            tr.doc,
            oldSelection.toJSON(),
          );
          tr.setSelection(newSelection);
          return tr;
        }
      }
    },
  });
}

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
