import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';


export default class ApplicationController extends Controller {
  @tracked rdfaEditor;
  @tracked debug;

  @action
  initDebug(info) {
    this.debug = info;
  }

  @action
  rdfaEditorInit(rdfaEditor) {
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.setHtmlContent('');
  }

  @action
  loadData(data) {
    this.rdfaEditor.setHtmlContent(data);
  }
}
