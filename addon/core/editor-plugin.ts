import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";

export interface EditorPlugin {
  get name(): string;
  initialize(controller: EditorController): Promise<void>;
}
