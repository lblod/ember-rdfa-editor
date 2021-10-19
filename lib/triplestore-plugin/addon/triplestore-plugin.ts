import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import {action} from "@ember/object";

export default class TriplestorePlugin implements EditorPlugin {
  private controller!: EditorController;

  get name(): string {
    return "triplestore";
  }

  constructor() {
  }

  create() {
    return new TriplestorePlugin();
  }

  async initialize(controller: EditorController) {
    this.controller = controller;

    controller.onEvent("modelRead", this.resetStore);


  }

  @action
  resetStore() {



  }

}
