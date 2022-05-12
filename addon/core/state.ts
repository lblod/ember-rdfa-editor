import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import HtmlNodeReader from "@lblod/ember-rdfa-editor/model/readers/html-node-reader";
import DomView from './view';

export default interface State {
  modelRoot: ModelElement;
  selection: ModelSelection;
}


export function fromDomView(view: DomView): State {

}
