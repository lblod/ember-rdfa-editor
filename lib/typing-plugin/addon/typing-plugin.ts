import {EditorPlugin} from "@lblod/ember-rdfa-editor/plugins/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import InsertTextCommand from "./commands/insert-text-command";
import {KeydownEvent} from "@lblod/ember-rdfa-editor/archive/utils/event-bus";

export default class TypingPlugin implements EditorPlugin {
  private controller!: EditorController;

  static create(): TypingPlugin {
    return new TypingPlugin();
  }

  get name(): string {
    return "typing";
  }

  async initialize(controller: EditorController): Promise<void> {
    controller.registerCommand(InsertTextCommand);
    controller.onEvent("keyDown", this.handleKeydown);
    this.controller = controller;
  }

  handleKeydown = (event: KeydownEvent) => {
    this.controller.executeCommand("insert-text", event.payload.key);
  };

}
