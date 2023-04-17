import { findParentNode } from '@curvenote/prosemirror-utils';
import { Attrs, NodeType } from 'prosemirror-model';
import { Command } from 'prosemirror-state';
import { PNode } from '@lblod/ember-rdfa-editor';
import { wrapInList } from 'prosemirror-schema-list';
import { liftOutOfNestedLists } from './lift-out-of-nested-lists';

function isListNode(node: PNode) {
  return node.type.name === 'ordered_list' || node.type.name === 'bullet_list';
}

export function toggleList(
  listType: NodeType,
  itemType: NodeType,
  attrs?: Attrs
): Command {
  return function (state, dispatch, view): boolean {
    const { selection } = state;
    const { $from, $to } = selection;
    // the range fully selects the content the surrounding blocknode of the selection
    // typically this will be the full contents of a list item when selection is collapsed,
    // or the list if multiple items are selected
    const blockRange = $from.blockRange($to);
    if (!blockRange) {
      return false;
    }
    const parentList = findParentNode((node) => isListNode(node))(selection);
    // NodeRange.depth is the depth of the parentnode of that range, aka the "node the range points into"
    // so if depth is 0, that's the root node
    const selectionParentIsNotRoot = blockRange.depth > 0;
    if (
      selectionParentIsNotRoot &&
      parentList &&
      blockRange.depth - parentList.depth <= 1
    ) {
      if (parentList.node.type === listType) {
        // list is of the same type as the one we toggle to, which means we "turn off" the list, aka remove it
        return liftOutOfNestedLists(itemType)(state, dispatch, view);
      }
      if (
        isListNode(parentList.node) &&
        listType.validContent(parentList.node.content)
      ) {
        if (dispatch) {
          const tr = state.tr;
          tr.setNodeMarkup(parentList.pos, listType, {
            ...parentList.node.attrs,
            ...attrs,
          });
          dispatch(tr);
        }
        return true;
      }
    }
    return wrapInList(listType, attrs)(state, dispatch, view);
  };
}
