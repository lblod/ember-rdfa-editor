import { supportsAttribute } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  findNodeByRdfaId,
  getBacklinks,
  getProperties,
  getRdfaId,
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
    if (!node || !supportsAttribute(node, 'backlinks')) {
      return false;
    }
    const backlinks = getBacklinks(node);
    const backlinkToRemove = backlinks?.[index];
    if (!backlinkToRemove) {
      return false;
    }
    console.log(backlinkToRemove);
    if (dispatch) {
      const updatedBacklinks = backlinks.slice();
      updatedBacklinks.splice(index, 1);
      const tr = state.tr;
      tr.setNodeAttribute(position, 'backlinks', updatedBacklinks);
      //Delete the inverse property
      const subjectNode = findNodeByRdfaId(tr.doc, backlinkToRemove.subjectId);
      if (subjectNode) {
        const subjectNodeProperties = getProperties(subjectNode.value);
        if (subjectNodeProperties) {
          const filteredProperties = subjectNodeProperties.filter((prop) => {
            return !(
              backlinkToRemove.predicate === prop.predicate &&
              backlinkToRemove.subjectId === getRdfaId(subjectNode.value)
            );
          });
          tr.setNodeAttribute(
            subjectNode.pos,
            'properties',
            filteredProperties,
          );
        }
      }
      dispatch(tr);
    }
    return true;
  };
}
