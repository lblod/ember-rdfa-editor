import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import IndentListCommand from "lists-plugin/commands/indent-list-command";
import InsertNewLiCommand from "lists-plugin/commands/insert-newLi-command";
import MakeListCommand from "lists-plugin/commands/make-list-command";
import RemoveListCommand from "lists-plugin/commands/remove-list-command";
import UnindentListCommand from "lists-plugin/commands/unindent-list-command";
import { KeydownEvent } from "@lblod/ember-rdfa-editor/archive/utils/event-bus";
import { action } from "@ember/object";
import handleTabInList from 'lists-plugin/handlers/handle-tab-in-list';
import handleEnterInList from 'lists-plugin/handlers/handle-enter-in-list';

export default class ListsPlugin implements EditorPlugin {
  private controller!: EditorController;
  static create(): ListsPlugin {
    return new ListsPlugin();
  }

  get name(): string {
    return "lists";
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController): Promise<void> {
    controller.registerCommand(IndentListCommand);
    controller.registerCommand(InsertNewLiCommand);
    controller.registerCommand(MakeListCommand);
    controller.registerCommand(RemoveListCommand);
    controller.registerCommand(UnindentListCommand);
    controller.onEvent("keyDown", this.handleKeydown);
    this.controller = controller;
  }

  @action
  handleKeydown(event: KeydownEvent) {
    const eventPayload = event.payload;
    // Still composing, don't handle this.
    if(eventPayload.isComposing) return;

    if (eventPayload.key === "Tab") {
      const reverse = eventPayload.shiftKey;
      handleTabInList(reverse, this.controller);
    } else if(eventPayload.key === 'Enter'){
      handleEnterInList(this.controller);
    }
  }
}
