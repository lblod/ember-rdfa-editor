import {
  findNodeByRdfaId,
  getBacklinks,
  getProperties,
  getRdfaId,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';

type RemovePropertyArgs = {
  position: number; // The position of the node from which to remove the property
  index: number; // The index of the property to be removed in the properties-array of the node
};

export function removeProperty({
  position,
  index,
}: RemovePropertyArgs): Command {
  return (state, dispatch) => {
    const node = state.doc.nodeAt(position);
    if (!node) {
      return false;
    }
    const properties = getProperties(node);
    const propertyToRemove = properties?.[index];
    if (!propertyToRemove) {
      return false;
    }
    if (dispatch) {
      const updatedProperties = properties.slice();
      updatedProperties.splice(index, 1);
      const tr = state.tr;
      tr.setNodeAttribute(position, 'properties', updatedProperties);
      if (propertyToRemove.type === 'node') {
        //Delete the inverse backlink
        const targetNode = findNodeByRdfaId(tr.doc, propertyToRemove.nodeId);
        if (targetNode) {
          const targetNodeBacklinks = getBacklinks(targetNode.value);
          if (targetNodeBacklinks) {
            const filteredBacklinks = targetNodeBacklinks.filter((backlink) => {
              return !(
                backlink.predicate === propertyToRemove.predicate &&
                backlink.subjectId === getRdfaId(node)
              );
            });
            tr.setNodeAttribute(targetNode.pos, 'backlinks', filteredBacklinks);
          }
        }
      }
      dispatch(tr);
    }
    return true;
  };
}
