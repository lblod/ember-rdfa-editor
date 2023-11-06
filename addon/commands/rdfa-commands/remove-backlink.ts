import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getBacklinks,
  getProperties,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';

type RemoveBacklinkArgs = {
  position: number; // The position of the node from which to remove the backlink
  index: number; // The index of the property to be removed in the backlinks-array of the node
};

export function removeBacklink({
  position,
  index,
}: RemoveBacklinkArgs): Command {
  return (state, dispatch) => {
    const node = state.doc.nodeAt(position);
    if (!node) {
      return false;
    }
    const backlinks = getBacklinks(node);
    const backlinkToRemove = backlinks?.[index];
    if (!backlinkToRemove) {
      return false;
    }
    if (!dispatch) {
      return true;
    }

    const updatedBacklinks = backlinks.slice();
    updatedBacklinks.splice(index, 1);
    const tr = state.tr;
    tr.setNodeAttribute(position, 'backlinks', updatedBacklinks);
    // Update the properties of each inverse subject node
    const subjects = getNodesByResource(state, backlinkToRemove.subject);
    subjects?.forEach((subject) => {
      const properties = getProperties(subject.value);
      if (properties) {
        const filteredProperties = properties.filter((prop) => {
          return !(
            backlinkToRemove.predicate === prop.predicate &&
            backlinkToRemove.subject === getResource(subject.value)
          );
        });
        tr.setNodeAttribute(subject.pos, 'properties', filteredProperties);
      }
    });
    dispatch(tr);

    return true;
  };
}
