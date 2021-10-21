import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import UndoCommand from "history-plugin/commands/undo-command";

export default class HistoryPlugin implements EditorPlugin {
  static create(): EditorPlugin {
    return new HistoryPlugin();
  }

  get name(): string {
    return "history";
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController): Promise<void> {
    controller.registerCommand(UndoCommand);
  }


}
