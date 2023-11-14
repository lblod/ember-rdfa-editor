import {
  getNodeByRdfaId,
  getNodesByResource,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  getBacklinks,
  getProperties,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command, Transaction } from 'prosemirror-state';

type RemovePropertyArgs = {
  resource: string; // The resource from which to remove a property
  index: number; // The index of the property to be removed in the properties-array of the resource
  /**
   A transaction to use in place of getting a new one from state.tr
   This can be used to call this command from within another, but care must be taken to not use
   the passed transaction between passing it in and when the callback is called.
   */
  transaction?: Transaction;
};

export function removeProperty({
  resource,
  index,
  transaction,
}: RemovePropertyArgs): Command {
  return (state, dispatch) => {
    const resourceNodes = getNodesByResource(state, resource);
    if (!resourceNodes?.length) {
      return false;
    }

    const properties = getProperties(resourceNodes[0].value);
    const propertyToRemove = properties?.[index];
    if (!propertyToRemove) {
      return false;
    }

    if (dispatch) {
      const updatedProperties = properties.slice();
      updatedProperties.splice(index, 1);

      const tr = transaction ?? state.tr;
      // Update the properties of all nodes defining the given resource
      resourceNodes.forEach((node) => {
        tr.setNodeAttribute(node.pos, 'properties', updatedProperties);
      });

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
                backlink.subject === resource
              );
            });
            tr.setNodeAttribute(target.pos, 'backlinks', filteredBacklinks);
          }
        });
      }
      dispatch(tr);
    }

    return true;
  };
}
