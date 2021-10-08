import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import FindNodesCommand from "searching-plugin/commands/find-nodes-command";
import MatchTextCommand from "searching-plugin/commands/match-text-command";

export default class SearchingPlugin implements EditorPlugin {
  static create(): SearchingPlugin {
    return new SearchingPlugin();
  }

  get name(): string {
    return "searching";
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController): Promise<void> {
    controller.registerCommand(FindNodesCommand);
    controller.registerCommand(MatchTextCommand);
  }


}
