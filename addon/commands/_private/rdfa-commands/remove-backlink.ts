import { ExternalPropertyObject } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
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
import { Command, Transaction } from 'prosemirror-state';

type RemoveBacklinkArgs = {
  target: ExternalPropertyObject;
  index: number;
  transaction?: Transaction;
};

export function removeBacklink({
  target,
  index,
  transaction,
}: RemoveBacklinkArgs): Command {
  return (state, dispatch) => {
    let nodes: ResolvedPNode[];
    if (target.type === 'literal') {
      const { rdfaId } = target;
      const node = getNodeByRdfaId(state, rdfaId);
      if (!node) {
        return false;
      }
      nodes = [node];
    } else {
      const { resource } = target;
      nodes = getNodesByResource(state, resource);
      if (!nodes?.length) {
        return false;
      }
    }
    const backlinks = getBacklinks(nodes[0].value);
    if (!backlinks?.length) {
      return false;
    }
    const backlinkToRemove = backlinks[index];
    if (!backlinkToRemove) {
      return false;
    }

    if (dispatch) {
      const updatedBacklinks = backlinks.slice();
      updatedBacklinks.splice(index, 1);
      const tr = transaction ?? state.tr;
      nodes.forEach((node) => {
        tr.setNodeAttribute(node.pos, 'backlinks', updatedBacklinks);
      });
      const subjects = getNodesByResource(state, backlinkToRemove.subject);
      subjects?.forEach((subject) => {
        const properties = getProperties(subject.value);
        if (properties) {
          const filteredProperties = properties.filter((prop) => {
            if (prop.type !== 'external') {
              return true;
            }

            if (target.type === 'literal' && prop.object.type === 'literal') {
              return !(
                backlinkToRemove.predicate === prop.predicate &&
                backlinkToRemove.subject === getResource(subject.value) &&
                prop.object.rdfaId === target.rdfaId
              );
            } else if (
              target.type === 'resource' &&
              prop.object.type === 'resource'
            ) {
              return !(
                backlinkToRemove.predicate === prop.predicate &&
                backlinkToRemove.subject === getResource(subject.value) &&
                prop.object.resource === target.resource
              );
            } else {
              return true;
            }
          });

          tr.setNodeAttribute(subject.pos, 'properties', filteredProperties);
        }
      });
      dispatch(tr);
    }
    return true;
  };
}
