import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked, TrackedSet } from 'tracked-built-ins';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

export default class IndexController extends Controller {
  @tracked rdfaEditor?: ProseController;
  @tracked plugins = new TrackedSet([
    'code-mark',
    'inline-components',
    'table',
    {
      name: 'highlight',
      options: {
        testKey: 'test',
      },
    },
  ]);

  @action
  rdfaEditorInit(rdfaEditor: ProseController) {
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
