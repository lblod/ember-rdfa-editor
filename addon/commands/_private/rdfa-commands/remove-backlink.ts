import {
  getNodeByRdfaId,
  getNodesByResource,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import TransformUtils from '@lblod/ember-rdfa-editor/utils/_private/transform-utils';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  getBacklinks,
  getProperties,
  getResource,
  isLinkToNode,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command, Transaction } from 'prosemirror-state';

type RemoveBacklinkArgs = {
  target:
    | { termType: 'LiteralNode'; rdfaId: string }
    | { termType: 'ResourceNode'; value: string };
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
    if (target.termType === 'LiteralNode') {
      const { rdfaId } = target;
      const node = getNodeByRdfaId(state, rdfaId);
      if (!node) {
        return false;
      }
      nodes = [node];
    } else {
      const { value: resource } = target;
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
        TransformUtils.setAttribute(
          tr,
          node.pos,
          'backlinks',
          updatedBacklinks,
        );
      });
      const subjects = getNodesByResource(state, backlinkToRemove.subject);
      subjects?.forEach((subject) => {
        const properties = getProperties(subject.value);
        if (properties) {
          const filteredProperties = properties.filter((prop) => {
            if (!isLinkToNode(prop)) {
              return true;
            }

            if (
              target.termType === 'LiteralNode' &&
              prop.object.termType === 'LiteralNode'
            ) {
              return !(
                backlinkToRemove.predicate === prop.predicate &&
                backlinkToRemove.subject === getResource(subject.value) &&
                prop.object.rdfaId === target.rdfaId
              );
            } else if (
              target.termType === 'ResourceNode' &&
              prop.object.termType === 'ResourceNode'
            ) {
              return !(
                backlinkToRemove.predicate === prop.predicate &&
                backlinkToRemove.subject === getResource(subject.value) &&
                prop.object.value === target.value
              );
            } else {
              return true;
            }
          });
          TransformUtils.setAttribute(
            tr,
            subject.pos,
            'properties',
            filteredProperties,
          );
        }
      });
      dispatch(tr);
    }
    return true;
  };
}
