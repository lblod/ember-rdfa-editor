import {
  IncomingProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';
import { supportsAttribute } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  findNodeByRdfaId,
  getProperties,
  getRdfaId,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';

type AddPropertyArgs = {
  /** The position of the node at which to add the property */
  position: number;
  /** Node or Attribute to add */
  property: OutgoingProp;
};

export function addProperty({ position, property }: AddPropertyArgs): Command {
  return (state, dispatch) => {
    const node = state.doc.nodeAt(position);

    if (!node || !supportsAttribute(node, 'properties')) {
      return false;
    }
    const resource = getResource(node);
    const rdfaId = getRdfaId(node);
    //We only support adding properties to resource nodes
    if (!resource || !rdfaId) {
      return false;
    }
    const properties = getProperties(node);
    if (dispatch) {
      const updatedProperties = properties
        ? [...properties, property]
        : [property];
      const tr = state.tr;
      tr.setNodeAttribute(position, 'properties', updatedProperties);
      if (property.type === 'node') {
        /**
         * TODO: we need two make two cases here
         * - The object of this property is a literal: we update the backlink of the corresponding content node, using its nodeId
         * - The object of this property is a namednode: we update the backlinks of the corresponding resource nodes, using the resource
         */
        const targetNode = findNodeByRdfaId(tr.doc, property.nodeId);
        if (targetNode && supportsAttribute(targetNode.value, 'backlinks')) {
          const backlinks = targetNode.value.attrs.backlinks as
            | IncomingProp[]
            | undefined;
          const newBacklink: IncomingProp = {
            predicate: property.predicate,
            subject: resource,
            subjectId: rdfaId,
          };
          const newBacklinks = backlinks
            ? [...backlinks, newBacklink]
            : [newBacklink];
          tr.setNodeAttribute(targetNode.pos, 'backlinks', newBacklinks);
        }
      }
      dispatch(tr);
    }
    return true;
  };
}
