import { getNodeByRdfaId } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { supportsAttribute } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
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
    if (!node || !supportsAttribute(node, 'properties')) {
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
        /**
         * TODO: we need two make two cases here
         * - The object of this property is a literal: we update the backlink of the corresponding content node, using its nodeId
         * - The object of this property is a namednode: we update the backlinks of the corresponding resource nodes, using the resource
         */
        const target = getNodeByRdfaId(state, propertyToRemove.nodeId);
        if (target) {
          const targetNodeBacklinks = getBacklinks(target.value);
          if (targetNodeBacklinks) {
            const filteredBacklinks = targetNodeBacklinks.filter((backlink) => {
              return !(
                backlink.predicate === propertyToRemove.predicate &&
                backlink.subjectId === getRdfaId(node)
              );
            });
            tr.setNodeAttribute(target.pos, 'backlinks', filteredBacklinks);
          }
        }
      }
      dispatch(tr);
    }
    return true;
  };
}
