import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";

export interface EditorPlugin {
  initialize(controller: EditorController): Promise<void>;
}
