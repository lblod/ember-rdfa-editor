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
  position: number; // The position of the node from which to remove the property
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
        //Add inverse backlink
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
