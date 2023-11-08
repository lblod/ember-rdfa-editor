import { getNodesByResource } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import {
  getBacklinks,
  getProperties,
  getResource,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { Command } from 'prosemirror-state';

type ClearBacklinksArgs = {
  position: number;
  callDispatchOnEarlyReturn?: boolean;
};

export function clearBacklinks({
  position,
  callDispatchOnEarlyReturn,
}: ClearBacklinksArgs): Command {
  return function (state, dispatch) {
    const callDispatch = () => {
      const tr = state.tr;

      if (dispatch && callDispatchOnEarlyReturn) {
        dispatch(tr);
      }
    };

    const node = state.doc.nodeAt(position);
    if (!node) {
      callDispatch();
      return false;
    }

    const backlinks = getBacklinks(node);
    if (!dispatch || !backlinks || backlinks.length === 0) {
      callDispatch();
      return true;
    }

    // When clearing the backlinks of a node, we also need to clear the inverse properties
    const tr = state.tr;
    tr.setNodeAttribute(position, 'backlinks', []);
    backlinks.forEach((backlink) => {
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
    });
    dispatch(tr);
    return true;
  };
}
