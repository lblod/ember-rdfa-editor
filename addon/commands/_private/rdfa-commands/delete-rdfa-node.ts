import { Command, NodeSelection } from 'prosemirror-state';

import { removeRdfaNodesWithProperties } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/index';

export const deleteRdfaNode: Command = (state, dispatch) => {
  if (!(state.selection instanceof NodeSelection)) {
    return false;
  }

  const { node } = state.selection;

  if (node.attrs.rdfaNodeType) {
    return removeRdfaNodesWithProperties({
      nodes: [{ value: node, pos: state.selection.from }],
    })(state, dispatch);
  }

  return false;
};
