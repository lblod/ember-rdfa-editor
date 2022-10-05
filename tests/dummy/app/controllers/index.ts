import Controller from '@ember/controller';
import { action } from '@ember/object';
import RdfaDocument from '@lblod/ember-rdfa-editor/core/controllers/rdfa-document';
import { tracked, TrackedSet } from 'tracked-built-ins';

export default class IndexController extends Controller {
  @tracked rdfaEditor?: RdfaDocument;
  @tracked plugins = new TrackedSet([
    'code-mark',
    'inline-components',
    'highlight',
  ]);

  @action
  rdfaEditorInit(rdfaEditor: RdfaDocument) {
    const presetContent = localStorage.getItem('EDITOR_CONTENT') ?? '';
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.setHtmlContent(presetContent);
    const editorDone = new CustomEvent('editor-done');
    window.dispatchEvent(editorDone);
  }

  @action
  togglePlugin(pluginName: string) {
    if (this.plugins.has(pluginName)) {
      this.plugins.delete(pluginName);
    } else {
      this.plugins.add(pluginName);
    }
  }
}
