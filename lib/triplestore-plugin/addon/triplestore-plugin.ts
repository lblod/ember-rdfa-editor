import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";

export default class TriplestorePlugin implements EditorPlugin {
  get name(): string {
    return "triplestore"
  }

  create() {
    return new TriplestorePlugin()
  }

  async initialize() {

  }

}
