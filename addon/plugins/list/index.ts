import {
  EditorState,
  PNode,
  ProsePlugin,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { changedDescendants } from '@lblod/ember-rdfa-editor/utils/_private/changed-descendants';

export { toggleList } from './commands/toggle-list';
export { liftOutOfNestedLists } from './commands/lift-out-of-nested-lists';
export {
  orderedListWithConfig,
  listItemWithConfig,
  bulletListWithConfig,
  ordered_list,
  list_item,
  bullet_list,
} from './nodes/list-nodes';
export type { OrderListStyle } from './nodes/list-nodes';
export { bullet_list_input_rule, ordered_list_input_rule } from './input_rules';

export function listTrackingPlugin(): ProsePlugin {
  return new ProsePlugin({
    appendTransaction(
      transactions: readonly Transaction[],
      oldState: EditorState,
      newState: EditorState,
    ) {
      if (transactions.some((tr) => tr.docChanged)) {
        console.log('running changedDescs', transactions, oldState, newState);
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
          for (const { node, pos } of changedLists) {
            calculateListTree(node, pos, tr);
          }
          return tr;
        }
      }
    },
  });
}

function calculateListTree(node: PNode, offset: number, tr: Transaction) {
  const path: number[] = [];
  updateListItems(node, path, offset, tr, node.attrs['style'] || 'unordered');
}
function updateListItems(
  node: PNode,
  path: number[],
  docPosOffset: number,
  tr: Transaction,
  style: string,
) {
  if (node.isLeaf) {
    return;
  }
  let counter = 0;
  let currentStyle = '';
  node.content.forEach((child: PNode, offset: number, index: number) => {
    if (child.type.name === 'list_item') {
      tr.setNodeAttribute(docPosOffset + offset + 1, 'listPath', [
        ...path,
        counter,
      ]);
      tr.setNodeAttribute(docPosOffset + offset + 1, 'listStyle', style);
      updateListItems(
        child,
        [...path, counter],
        docPosOffset + offset + 1,
        tr,
        style,
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
        child.attrs['style'] ?? style,
      );
    } else {
      updateListItems(child, path, docPosOffset + offset + 1, tr, style);
    }
  });
}
