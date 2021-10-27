import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import InsertHtmlCommand from "content-control-plugin/commands/insert-html-command";
import InsertXmlCommand from "content-control-plugin/commands/insert-xml-command";
import GetContentQuery from "content-control-plugin/queries/get-content-query";
import SelectionCommand from "content-control-plugin/commands/selection-command";

export default class ContentControlPlugin implements EditorPlugin {
  static create(): ContentControlPlugin {
    return new ContentControlPlugin();
  }

  get name() {
    return "content-control";
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController) {
    controller.registerCommand(InsertHtmlCommand);
    controller.registerCommand(InsertXmlCommand);
    controller.registerCommand(SelectionCommand);
    controller.registerQuery(GetContentQuery);
  }

}
