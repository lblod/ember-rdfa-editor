import { findParentNode } from '@curvenote/prosemirror-utils';
import { NodeType } from 'prosemirror-model';
import { Command } from 'prosemirror-state';
import { PNode } from '@lblod/ember-rdfa-editor';
import { liftListItem } from 'prosemirror-schema-list';

function isListNode(node: PNode) {
  return node.type.name === 'ordered_list' || node.type.name === 'bullet_list';
}

export function toggleList(listType: NodeType, itemType: NodeType): Command {
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
        return liftListItem(itemType)(state, dispatch, view);
      }
    }
  };
}
