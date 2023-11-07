import {
  getNodeByRdfaId,
  getNodesByResource,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getBacklinks,
  getProperties,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';

type RemoveLiteralBacklinkArgs = {
  rdfaId: string; // The rdfaId of the content node from which we want to remove the backlink
};

export function removeBacklinkFromLiteral({
  rdfaId,
}: RemoveLiteralBacklinkArgs): Command {
  return (state, dispatch) => {
    const node = getNodeByRdfaId(state, rdfaId);
    if (!node) {
      return false;
    }
    const backlink = getBacklinks(node.value)?.[0];
    if (!backlink) {
      return false;
    }

    if (dispatch) {
      const tr = state.tr;
      // Remove the backlink from the literal/content node (drop all the backlinks)
      tr.setNodeAttribute(node.pos, 'backlinks', []);

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
      dispatch(tr);
    }

    return true;
  };
}
