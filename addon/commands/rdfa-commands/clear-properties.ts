import { getNodeByRdfaId } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { supportsAttribute } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
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
    if (!node || !supportsAttribute(node, 'properties')) {
      return false;
    }
    const properties = getProperties(node);
    if (properties && dispatch) {
      //When clearing the properties of a node, we also need to clear the inverse backlinks
      const tr = state.tr;
      tr.setNodeAttribute(position, 'properties', []);
      properties.forEach((prop) => {
        if (prop.type === 'node') {
          /**
           * TODO: we need two make two cases here
           * - The object of this property is a literal: we update the backlink of the corresponding content node, using its nodeId
           * - The object of this property is a namednode: we update the backlinks of the corresponding resource nodes, using the resource
           */
          const target = getNodeByRdfaId(state, prop.nodeId);
          if (target) {
            const targetNodeBacklinks = getBacklinks(target.value);
            if (targetNodeBacklinks) {
              const filteredBacklinks = targetNodeBacklinks.filter(
                (backlink) => {
                  return !(
                    backlink.predicate === prop.predicate &&
                    backlink.subjectId === getRdfaId(node)
                  );
                },
              );
              tr.setNodeAttribute(target.pos, 'backlinks', filteredBacklinks);
            }
          }
        }
      });
      dispatch(tr);
    }
    return true;
  };
}
