import { Backlink } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { Command, Transaction } from 'prosemirror-state';
import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getProperties,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/_private/rdfa-utils';

export const removePropertiesTargetingBacklinks = ({
  backlink,
  transaction,
  rdfaId,
}: {
  backlink: Backlink;
  transaction: Transaction;
  rdfaId?: string;
}): Command => {
  return (state, dispatch) => {
    const tr = transaction ?? state.tr;

    if (dispatch) {
      const subjects = getNodesByResource(state, backlink.subject);

      subjects?.forEach((subject) => {
        const properties = getProperties(subject.value);
        if (properties) {
          const filteredProperties = properties.filter((prop) => {
            if (rdfaId) {
              if (prop.type !== 'external') {
                return true;
              }

              if (prop.object.type !== 'literal') {
                return true;
              }

              if (prop.object.rdfaId !== rdfaId) {
                return true;
              }
            }

            return !(
              backlink.predicate === prop.predicate &&
              backlink.subject === getResource(subject.value)
            );
          });

          transaction.setNodeAttribute(
            subject.pos,
            'properties',
            filteredProperties,
          );
        }
      });

      dispatch(tr);
    }

    return true;
  };
};
