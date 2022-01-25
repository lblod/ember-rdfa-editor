import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import RdfaDocument from '@lblod/ember-rdfa-editor/utils/rdfa/rdfa-document';

export default class DebugController extends Controller {
  @tracked rdfaEditor?: RdfaDocument;

  @action
  rdfaEditorInit(rdfaEditor: RdfaDocument) {
    const presetContent = localStorage.getItem('EDITOR_CONTENT') ?? '';
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }
}
