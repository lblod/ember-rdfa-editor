import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";

export default class DeletionPlugin implements EditorPlugin {
  static create(): EditorPlugin {
    return new DeletionPlugin();
  }

  get name(): string {
    return "deletion";
  }

  // eslint-disable-next-line @typescript-eslint/require-await,@typescript-eslint/no-empty-function
  async initialize(_controller: EditorController): Promise<void> {
  }


}
