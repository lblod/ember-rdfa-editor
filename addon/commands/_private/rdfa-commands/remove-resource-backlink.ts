import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getBacklinks,
  getProperties,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';

type RemoveResourceBacklinkArgs = {
  resource: string; // The resource from which to remove a backlink
  index: number; // The index of the property to be removed in the backlinks-array of the node
};

export function removeBacklinkFromResource({
  resource,
  index,
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

      const tr = state.tr;
      // Update the backlinks of each node defining the given resource
      nodes.forEach((node) => {
        tr.setNodeAttribute(node.pos, 'backlinks', updatedBacklinks);
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
          tr.setNodeAttribute(subject.pos, 'properties', filteredProperties);
        }
      });
      dispatch(tr);
    }

    return true;
  };
}
