import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import TransformUtils from '@lblod/ember-rdfa-editor/utils/_private/transform-utils';
import {
  getBacklinks,
  getProperties,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command, Transaction } from 'prosemirror-state';

type RemoveResourceBacklinkArgs = {
  resource: string; // The resource from which to remove a backlink
  index: number; // The index of the property to be removed in the backlinks-array of the node
  /**
   A transaction to use in place of getting a new one from state.tr
   This can be used to call this command from within another, but care must be taken to not use
   the passed transaction between passing it in and when the callback is called.
   */
  transaction?: Transaction;
};

export function removeBacklinkFromResource({
  resource,
  index,
  transaction,
}: RemoveResourceBacklinkArgs): Command {
  return (state, dispatch) => {
    const nodes = getNodesByResource(state, resource);
    if (!nodes?.length) {
      return false;
    }

    const backlinks = getBacklinks(nodes[0].value);
    const backlinkToRemove = backlinks?.[index];
    if (!backlinkToRemove) {
      return false;
    }

    if (dispatch) {
      const updatedBacklinks = backlinks.slice();
      updatedBacklinks.splice(index, 1);

      const tr = transaction ?? state.tr;
      // Update the backlinks of each node defining the given resource
      nodes.forEach((node) => {
        TransformUtils.setAttribute(
          tr,
          node.pos,
          'backlinks',
          updatedBacklinks,
        );
      });

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
          TransformUtils.setAttribute(
            tr,
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
}
