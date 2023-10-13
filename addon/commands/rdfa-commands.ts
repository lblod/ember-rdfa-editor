import { Command } from 'prosemirror-state';

type ClearPropertiesArgs = {
  position: number;
};

export function clearProperties({ position }: ClearPropertiesArgs): Command {
  return function (state, dispatch) {
    if (dispatch) {
      //TODO: when clearing the properties of a node, we also need to clear the inverse backlinks
      const tr = state.tr;
      tr.setNodeAttribute(position, 'properties', []);
      dispatch(tr);
    }
    return true;
  };
}

type ClearBacklinksArgs = {
  position: number;
};

export function clearBacklinks({ position }: ClearBacklinksArgs): Command {
  return function (state, dispatch) {
    if (dispatch) {
      //TODO: when clearing the bakclinks of a node, we also need to clear the inverse properties

      const tr = state.tr;
      tr.setNodeAttribute(position, 'backlinks', []);
      dispatch(tr);
    }
    return true;
  };
}
