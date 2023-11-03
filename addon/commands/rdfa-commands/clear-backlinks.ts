import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { supportsAttribute } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  getBacklinks,
  getProperties,
  getRdfaId,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';

type ClearBacklinksArgs = {
  position: number;
};

export function clearBacklinks({ position }: ClearBacklinksArgs): Command {
  return function (state, dispatch) {
    const node = state.doc.nodeAt(position);
    if (!node || !supportsAttribute(node, 'backlinks')) {
      return false;
    }
    const backlinks = getBacklinks(node);
    if (backlinks && dispatch) {
      //When clearing the backlinks of a node, we also need to clear the inverse properties
      const tr = state.tr;
      tr.setNodeAttribute(position, 'backlinks', []);
      backlinks.forEach((backlink) => {
        // Update the properties of each inverse subject node
        const subjects = getNodesByResource(state, backlink.subject);
        subjects?.forEach((subject) => {
          const subjectNodeProperties = getProperties(subject.value);
          if (subjectNodeProperties) {
            const filteredProperties = subjectNodeProperties.filter((prop) => {
              return !(
                backlink.predicate === prop.predicate &&
                backlink.subjectId === getRdfaId(subject.value)
              );
            });
            tr.setNodeAttribute(subject.pos, 'properties', filteredProperties);
          }
        });
      });
      dispatch(tr);
    }
    return true;
  };
}
