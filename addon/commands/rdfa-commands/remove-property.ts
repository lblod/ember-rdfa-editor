import {
  getNodeByRdfaId,
  getNodesByResource,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  getBacklinks,
  getProperties,
  getResource,
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
    if (!dispatch) {
      return true;
    }

    const updatedProperties = properties.slice();
    updatedProperties.splice(index, 1);
    const tr = state.tr;
    tr.setNodeAttribute(position, 'properties', updatedProperties);
    if (propertyToRemove.type === 'external') {
      const { object } = propertyToRemove;
      /**
       * We need two make two cases here
       * - The object of this property is a literal: we update the backlink of the corresponding content node, using its nodeId
       * - The object of this property is a namednode: we update the backlinks of the corresponding resource nodes, using the resource
       */
      let targets: ResolvedPNode[] | undefined;
      if (object.type === 'literal') {
        const target = getNodeByRdfaId(state, object.rdfaId);
        if (target) {
          targets = [target];
        }
      } else {
        targets = getNodesByResource(state, object.resource);
      }
      targets?.forEach((target) => {
        const backlinks = getBacklinks(target.value);
        if (backlinks) {
          const filteredBacklinks = backlinks.filter((backlink) => {
            return !(
              backlink.predicate === propertyToRemove.predicate &&
              backlink.subject === getResource(node)
            );
          });
          tr.setNodeAttribute(target.pos, 'backlinks', filteredBacklinks);
        }
      });
    }
    dispatch(tr);
    return true;
  };
}
