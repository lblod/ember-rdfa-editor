import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  @tracked rdfaEditor;
  @tracked debug;
  @service() features;

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

  @action
  setPasteBehaviour(event) {
    const val = event.target.value;
    if (val === "textonly") {
      this.features.disable('editor-extended-html-paste');
      this.features.disable('editor-html-paste');
    }
    else if (val === "limited") {
      this.features.disable('editor-extended-html-paste');
      this.features.enable('editor-html-paste');
    }
    else if (val === "full") {
      this.features.enable('editor-extended-html-paste');
      this.features.enable('editor-html-paste');
    }
  }
}
