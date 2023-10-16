import { supportsAttribute } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  findNodeByRdfaId,
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
        const subjectNode = findNodeByRdfaId(tr.doc, backlink.subjectId);
        if (subjectNode) {
          const subjectNodeProperties = getProperties(subjectNode.value);
          if (subjectNodeProperties) {
            const filteredProperties = subjectNodeProperties.filter((prop) => {
              return !(
                backlink.predicate === prop.predicate &&
                backlink.subjectId === getRdfaId(subjectNode.value)
              );
            });
            tr.setNodeAttribute(
              subjectNode.pos,
              'properties',
              filteredProperties,
            );
          }
        }
      });
      dispatch(tr);
    }
    return true;
  };
}
