import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import MarksRegistry from '../model/marks-registry';

export default interface State {
  document: ModelElement;
  selection: ModelSelection;
  plugins: EditorPlugin[];
  marksRegistry: MarksRegistry;
}

export function emptyState(): State {
  return {
    document: new ModelElement('div'),
    selection: new ModelSelection(),
    plugins: [],
    marksRegistry: new MarksRegistry(),
  };
}

export function cloneState(state: State): State {
  const documentClone = state.document.clone();
  const selectionClone = state.selection.clone(documentClone);
  return {
    document: documentClone,
    marksRegistry: state.marksRegistry,
    plugins: [...state.plugins],
    selection: selectionClone,
  };
}
