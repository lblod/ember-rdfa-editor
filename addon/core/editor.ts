import State, { emptyState } from '@lblod/ember-rdfa-editor/core/state';
import { EditorPlugin } from '../utils/editor-plugin';
import Transaction from './transaction';
import { View, EditorView } from './view';
export default interface EditorArgs {
  domRoot: HTMLElement;
  plugins: EditorPlugin[];
}

export interface Editor {
  state: State;
  view: View;
}

export function createEditor(args: EditorArgs): Editor {
  const { domRoot, plugins } = args;
  const view = new EditorView(domRoot);

  let initialState = emptyState();
  const tr = new Transaction(initialState);
  tr.setPlugins(plugins);
  tr.readFromView(view);
  initialState = tr.apply();
  view.update(initialState);

  return {
    state: initialState,
    view,
  };
}
