import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import IndentListCommand from "lists-plugin/commands/indent-list-command";
import InsertNewLiCommand from "lists-plugin/commands/insert-newLi-command";
import MakeListCommand from "lists-plugin/commands/make-list-command";
import RemoveListCommand from "lists-plugin/commands/remove-list-command";
import UnindentListCommand from "lists-plugin/commands/unindent-list-command";

export default class ListsPlugin implements EditorPlugin {
  create(): ListsPlugin {
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
  }


}
