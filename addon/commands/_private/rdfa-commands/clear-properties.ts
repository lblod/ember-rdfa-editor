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
import { Command, Transaction, EditorState } from 'prosemirror-state';
import { Property } from '@lblod/ember-rdfa-editor/core/say-parser';
import { PNode } from '@lblod/ember-rdfa-editor';

type ClearPropertiesArgs = {
  position: number;
};

export function clearProperties({ position }: ClearPropertiesArgs): Command {
  return function (state, dispatch) {
    const node = state.doc.nodeAt(position);
    if (!node) {
      return false;
    }
    const properties = getProperties(node);
    if (!dispatch || !properties) {
      return true;
    }

    //When clearing the properties of a node, we also need to clear the inverse backlinks
    const tr = state.tr;
    tr.setNodeAttribute(position, 'properties', []);
    properties.forEach((prop) => {
      if (prop.type === 'external') {
        const object = prop.object;

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
          const backlinks = getBacklinks(target.value);
          if (backlinks) {
            const filteredBacklinks = backlinks.filter((backlink) => {
              return !(
                backlink.predicate === prop.predicate &&
                backlink.subject === getResource(node)
              );
            });
            tr.setNodeAttribute(target.pos, 'backlinks', filteredBacklinks);
          }
        });
      }
    });
    dispatch(tr);
    return true;
  };
}

// TODO: Check if this can be reused inside `clearProperties` command so we don't have to duplicate the logic
export const clearPropertiesTransaction =
  ({ state, positions }: { state: EditorState; positions: number[] }) =>
  (tr: Transaction) => {
    const nodes = positions
      .map((pos) => state.doc.nodeAt(pos))
      .filter((node): node is PNode => Boolean(node));

    if (!nodes.length) {
      return;
    }

    const properties = nodes
      .map((node) => getProperties(node))
      .filter((properties): properties is Property[] => !!properties)
      .flat();

    if (!properties.length) {
      return;
    }

    console.log({ properties });

    positions.forEach((position) => {
      tr.setNodeAttribute(position, 'properties', []);
    });

    const subjects = new Map<ResolvedPNode, Property[]>();

    properties.forEach((property) => {
      if (property.type !== 'external') {
        return;
      }

      const object = property.object;
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
        subjects.set(target, [...(subjects.get(target) ?? []), property]);
      });
    });

    console.log({ subjects });

    subjects.forEach((properties, subject) => {
      const backlinks = getBacklinks(subject.value);

      if (backlinks) {
        const filteredBacklinks = backlinks.filter(
          (backlink) =>
            !properties.some(
              (property) =>
                backlink.predicate === property.predicate &&
                backlink.subject === getResource(subject.value),
            ),
        );

        console.log({ filteredBacklinks });

        tr.setNodeAttribute(subject.pos, 'backlinks', filteredBacklinks);
      }
    });

    return true;
  };
