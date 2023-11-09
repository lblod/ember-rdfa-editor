import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getBacklinks,
  getProperties,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';
import { EditorState, PNode, Transaction } from '@lblod/ember-rdfa-editor';
import { Backlink } from '@lblod/ember-rdfa-editor/core/say-parser';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

type ClearBacklinksArgs = {
  position: number;
};

export function clearBacklinks({ position }: ClearBacklinksArgs): Command {
  return function (state, dispatch) {
    const node = state.doc.nodeAt(position);
    if (!node) {
      return false;
    }

    const backlinks = getBacklinks(node);
    if (!dispatch || !backlinks || backlinks.length === 0) {
      return true;
    }

    // When clearing the backlinks of a node, we also need to clear the inverse properties
    const tr = state.tr;
    tr.setNodeAttribute(position, 'backlinks', []);
    backlinks.forEach((backlink) => {
      // Update the properties of each inverse subject node
      const subjects = getNodesByResource(state, backlink.subject);
      subjects?.forEach((subject) => {
        const properties = getProperties(subject.value);
        if (properties) {
          const filteredProperties = properties.filter((prop) => {
            return !(
              backlink.predicate === prop.predicate &&
              backlink.subject === getResource(subject.value)
            );
          });
          tr.setNodeAttribute(subject.pos, 'properties', filteredProperties);
        }
      });
    });
    dispatch(tr);
    return true;
  };
}

// TODO: Check if this can be reused inside `clearBacklinks` command so we don't have to duplicate the logic
export const clearBacklinksTransaction =
  ({ state, positions }: { state: EditorState; positions: number[] }) =>
  (tr: Transaction) => {
    const nodes = positions
      .map((pos) => state.doc.nodeAt(pos))
      .filter((node): node is PNode => Boolean(node));

    if (!nodes.length) {
      return;
    }

    const backlinks = nodes
      .map((node) => getBacklinks(node))
      .filter((backlink): backlink is Backlink[] => !!backlink)
      .flat();

    if (!backlinks || backlinks.length === 0) {
      return;
    }

    positions.forEach((position) => {
      tr.setNodeAttribute(position, 'backlinks', []);
    });

    // Map of subjects with all the backlinks that resolve to them
    const subjects = new Map<ResolvedPNode, Backlink[]>();

    backlinks.forEach((backlink) => {
      const subjectNodes = getNodesByResource(state, backlink.subject);

      subjectNodes?.forEach((subject) => {
        subjects.set(subject, [...(subjects.get(subject) ?? []), backlink]);
      });
    });

    subjects.forEach((backlinks, subject) => {
      const properties = getProperties(subject.value);

      if (properties) {
        // filter out properties of all the backlinks that resolve to this subject
        const filteredProperties = properties.filter(
          (prop) =>
            !backlinks.some(
              (backlink) =>
                backlink.predicate === prop.predicate &&
                backlink.subject === getResource(subject.value),
            ),
        );

        tr.setNodeAttribute(subject.pos, 'properties', filteredProperties);
      }
    });

    return true;
  };
