import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";

export default class ClipboardPlugin implements EditorPlugin {
  get name(): string {
    return 'clipboard';
  }

  static create() {
    return new ClipboardPlugin();
  }

  async initialize(controller: EditorController) {
  }

}
