import {
  findNodeByRdfaId,
  getBacklinks,
  getProperties,
  getRdfaId,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';

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
    if (properties && dispatch) {
      //When clearing the properties of a node, we also need to clear the inverse backlinks
      const tr = state.tr;
      tr.setNodeAttribute(position, 'properties', []);
      properties.forEach((prop) => {
        if (prop.type === 'node') {
          const targetNode = findNodeByRdfaId(tr.doc, prop.nodeId);
          if (targetNode) {
            const targetNodeBacklinks = getBacklinks(targetNode.value);
            if (targetNodeBacklinks) {
              const filteredBacklinks = targetNodeBacklinks.filter(
                (backlink) => {
                  return !(
                    backlink.predicate === prop.predicate &&
                    backlink.subjectId === getRdfaId(node)
                  );
                },
              );
              tr.setNodeAttribute(
                targetNode.pos,
                'backlinks',
                filteredBacklinks,
              );
            }
          }
        }
      });
      dispatch(tr);
    }
    return true;
  };
}
