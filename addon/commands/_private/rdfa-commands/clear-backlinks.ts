import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getBacklinks,
  getProperties,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';
import { EditorState, Transaction } from '@lblod/ember-rdfa-editor';

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
  ({ state, position }: { state: EditorState; position: number }) =>
  (tr: Transaction) => {
    const node = state.doc.nodeAt(position);
    if (!node) {
      return;
    }

    const backlinks = getBacklinks(node);
    if (!backlinks || backlinks.length === 0) {
      return;
    }

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
    return true;
  };
