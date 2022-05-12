import State, { fromDomView } from '@lblod/ember-rdfa-editor/core/state';
import { InputHandler } from '../components/ce/input-handler';
import { EditorPlugin } from '../utils/editor-plugin';
import DomView, { createDomView } from './view';

export default interface Editor {
  state: State;
  view: DomView;
  plugins: EditorPlugin[];
}
export function createEditor(
  domRoot: HTMLElement,
  plugins: EditorPlugin[]
): Editor {
  const view = createDomView(domRoot);
  const initialState = fromDomView(view);
  return {
    state: initialState,
    view: createDomView(domRoot),
    plugins,
  };
}
