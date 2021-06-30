import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import RdfaDocument from "@lblod/ember-rdfa-editor/utils/rdfa/rdfa-document";

interface FeaturesService {
  disable: (feature: string) => void;
  enable: (feature: string) => void
}

export default class IndexController extends Controller {

  @tracked rdfaEditor?: RdfaDocument;
  @tracked debug: unknown;
  @service features!: FeaturesService;

  @action
  initDebug(info: unknown) {
    this.debug = info;
  }

  @action
  rdfaEditorInit(rdfaEditor: RdfaDocument) {
    this.rdfaEditor = rdfaEditor;
    this.rdfaEditor.setHtmlContent('');
    const editorDone = new CustomEvent("editor-done");
    window.dispatchEvent(editorDone);
  }

  @action
  loadData(data: string) {
    this.rdfaEditor?.setHtmlContent(data);
  }

  @action
  loadCustomData() {
    const customData = window.prompt('Enter XML here');
    if (customData) {
      this.loadData(customData);
    }
  }


  @action
  setPasteBehaviour(event: InputEvent) {
    const val = (event.target as HTMLSelectElement).value;
    if (val === "textonly") {
      this.features.disable('editor-extended-html-paste');
      this.features.disable('editor-html-paste');
    } else if (val === "limited") {
      this.features.disable('editor-extended-html-paste');
      this.features.enable('editor-html-paste');
    } else if (val === "full") {
      this.features.enable('editor-extended-html-paste');
      this.features.enable('editor-html-paste');
    }
  }

}
