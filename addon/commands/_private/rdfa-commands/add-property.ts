import {
  Backlink,
  Property,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import {
  getNodeByRdfaId,
  getNodesByResource,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { getProperties } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';

export type AddPropertyArgs = {
  /** The resource to which to add a property */
  resource: string;
  /** Property to add */
  property: Property;
};

export function addProperty({ resource, property }: AddPropertyArgs): Command {
  return (state, dispatch) => {
    const resourceNodes = getNodesByResource(state, resource);
    if (!resourceNodes?.length) {
      return false;
    }

    if (dispatch) {
      const properties = getProperties(resourceNodes[0].value);
      const updatedProperties = properties
        ? [...properties, property]
        : [property];

      const tr = state.tr;
      // Update the properties of each node that defines the given resource
      resourceNodes.forEach((node) => {
        tr.setNodeAttribute(node.pos, 'properties', updatedProperties);
      });

      if (property.type === 'external') {
        const newBacklink: Backlink = {
          subject: resource,
          predicate: property.predicate,
        };
        const { object } = property;
        let targets: ResolvedPNode[] | undefined;
        /**
         * We need two make two cases here
         * - The object of this property is a literal: we update the backlink of the corresponding content node, using its nodeId
         * - The object of this property is a namednode: we update the backlinks of the corresponding resource nodes, using the resource
         */
        if (object.type === 'literal') {
          const target = getNodeByRdfaId(state, object.rdfaId);
          if (target) {
            targets = [target];
          }
        } else {
          targets = getNodesByResource(state, object.resource);
        }
        targets?.forEach((target) => {
          const backlinks = target.value.attrs.backlinks as
            | Backlink[]
            | undefined;
          const newBacklinks = backlinks
            ? [...backlinks, newBacklink]
            : [newBacklink];
          tr.setNodeAttribute(target.pos, 'backlinks', newBacklinks);
        });
      }
      dispatch(tr);
    }
    return true;
  };
}
