import { Property } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { Command, Transaction } from 'prosemirror-state';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  getNodeByRdfaId,
  getNodesByResource,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { getBacklinks } from '@lblod/ember-rdfa-editor/utils/_private/rdfa-utils';

type Args = {
  property: Property;
  resource: string;
  /**
   A transaction to use in place of getting a new one from state.tr
   This can be used to call this command from within another, but care must be taken to not use
   the passed transaction between passing it in and when the callback is called.
   */
  transaction: Transaction;
};

export const removeBacklinksTargetingResourceProperty = ({
  resource,
  property,
  transaction,
}: Args): Command => {
  return (state, dispatch) => {
    const tr = transaction ?? state.tr;

    if (dispatch) {
      if (property.type === 'external') {
        const { object } = property;
        /**
         * We need two make two cases here
         * - The object of this property is a literal: we update the backlink of the corresponding content node, using its nodeId
         * - The object of this property is a namednode: we update the backlinks of the corresponding resource nodes, using the resource
         */
        let targets: ResolvedPNode[] | undefined;
        if (object.type === 'literal') {
          const target = getNodeByRdfaId(state, object.rdfaId);
          if (target) {
            targets = [target];
          }
        } else {
          targets = getNodesByResource(state, object.resource);
        }
        targets?.forEach((target) => {
          const backlinks = getBacklinks(target.value);
          if (backlinks) {
            const filteredBacklinks = backlinks.filter((backlink) => {
              return !(
                backlink.predicate === property.predicate &&
                backlink.subject === resource
              );
            });
            tr.setNodeAttribute(target.pos, 'backlinks', filteredBacklinks);
          }
        });
      }

      dispatch(tr);
    }

    return true;
  };
};
