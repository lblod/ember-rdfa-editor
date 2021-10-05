import {EditorPlugin} from "@lblod/ember-rdfa-editor/plugins/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import InsertTextCommand from "@lblod/ember-rdfa-editor/plugins/typing/commands/insert-text-command";
import {KeydownEvent} from "@lblod/ember-rdfa-editor/archive/utils/event-bus";

export default class TypingPlugin implements EditorPlugin {
  private controller!: EditorController;

  get name(): string {
    return "typing";
  }

  async initialize(controller: EditorController): Promise<void> {
    controller.registerCommand(InsertTextCommand);
    controller.onEvent("keyDown", this.handleKeydown);
    this.controller = controller;
  }

  handleKeydown = (event: KeydownEvent) => {
    console.log("event being handled")
    this.controller.executeCommand("insert-text", event.payload.key);
  };

}
