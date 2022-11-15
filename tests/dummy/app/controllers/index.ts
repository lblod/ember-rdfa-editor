import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import RdfaDocument from '@lblod/ember-rdfa-editor/utils/rdfa/rdfa-document';

export default class IndexController extends Controller {
  @tracked rdfaEditor?: RdfaDocument;
  @tracked plugins = [
    { name: 'dummy', options: { testKey: 'hello' } },
    'inline-components',
  ];

  @action
  rdfaEditorInit(rdfaEditor: RdfaDocument) {
    const presetContent = localStorage.getItem('EDITOR_CONTENT') ?? '';
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }
}
