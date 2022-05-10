import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import HtmlNodeReader from "@lblod/ember-rdfa-editor/model/readers/html-node-reader";

export default interface State {
  modelRoot: ModelElement;
  selection: ModelSelection;
  plugins: EditorPlugin[];
}

export function fromReadHtml(domRoot: HTMLElement): State {
  const htmlReader = new HtmlNodeReader();


}
