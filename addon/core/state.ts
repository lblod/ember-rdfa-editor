import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import MarksRegistry from '../model/marks-registry';
import ModelNode from '../model/model-node';
import HtmlReader from '../model/readers/html-reader';
import { NotImplementedError } from '../utils/errors';
import { View } from "./View";

export default interface State {
  modelRoot: ModelElement;
  selection: ModelSelection;
  plugins: EditorPlugin[];
  marksRegistry: MarksRegistry;
}


export function fromView(view: View,marksRegistry: MarksRegistry, plugins: EditorPlugin[]=[]): State {

  const reader = new HtmlReader();
  const parsedNodes = reader.read(view.domRoot, view, true);
  if(parsedNodes.length > 1) {
    throw new NotImplementedError();
  }
  const modelRoot = parsedNodes[0];
  return {
    modelRoot,
    plugins,
    marksRegistry

  }

}

export function emptyState(): State {
  return {
    modelRoot: new ModelElement("div"),
    selection: new ModelSelection(),
    plugins: [],
    marksRegistry: new MarksRegistry()
  }
}
export function cloneState(state: State): State {
  return {...state}
}
