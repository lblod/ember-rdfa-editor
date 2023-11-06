import { Backlink, Property } from '@lblod/ember-rdfa-editor/core/say-parser';
import {
  getNodeByRdfaId,
  getNodesByResource,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  getProperties,
  getRdfaId,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';

export type AddPropertyArgs = {
  /** The position of the node at which to add the property */
  position: number;
  /** Node or Attribute to add */
  property: Property;
};

export function addProperty({ position, property }: AddPropertyArgs): Command {
  return (state, dispatch) => {
    const node = state.doc.nodeAt(position);

    if (!node) {
      return false;
    }
    const resource = getResource(node);
    const rdfaId = getRdfaId(node);
    //We only support adding properties to resource nodes
    if (!resource || !rdfaId) {
      return false;
    }
    if (!dispatch) {
      return true;
    }

    const properties = getProperties(node);
    const updatedProperties = properties
      ? [...properties, property]
      : [property];
    const tr = state.tr;
    tr.setNodeAttribute(position, 'properties', updatedProperties);
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
    return true;
  };
}
