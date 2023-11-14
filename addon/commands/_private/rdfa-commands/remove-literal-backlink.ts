import {
  getNodeByRdfaId,
  getNodesByResource,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getBacklinks,
  getProperties,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command, Transaction } from 'prosemirror-state';

type RemoveLiteralBacklinkArgs = {
  rdfaId: string; // The rdfaId of the content node from which we want to remove the backlink
  /**
   A transaction to use in place of getting a new one from state.tr
   This can be used to call this command from within another, but care must be taken to not use
   the passed transaction between passing it in and when the callback is called.
   */
  transaction?: Transaction;
};

export function removeBacklinkFromLiteral({
  rdfaId,
  transaction,
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
      const tr = transaction ?? state.tr;
      // Remove the backlink from the literal/content node (drop all the backlinks)
      tr.setNodeAttribute(node.pos, 'backlinks', []);

      // Update the properties of each inverse subject node
      const subjects = getNodesByResource(state, backlink.subject) ?? [];

      subjects?.forEach((subject) => {
        const properties = getProperties(subject.value);
        if (properties) {
          const filteredProperties = properties.filter((prop) => {
            if (prop.type !== 'external') {
              return true;
            }

            if (prop.object.type !== 'literal') {
              return true;
            }

            if (prop.object.rdfaId !== rdfaId) {
              return true;
            }

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
