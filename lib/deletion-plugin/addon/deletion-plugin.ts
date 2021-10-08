import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import DeleteSelectionCommand from "deletion-plugin/commands/delete-selection-command";

export default class DeletionPlugin implements EditorPlugin {
  static create(): EditorPlugin {
    return new DeletionPlugin();
  }

  get name(): string {
    return "deletion";
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController): Promise<void> {
    controller.registerCommand(DeleteSelectionCommand);
  }


}
