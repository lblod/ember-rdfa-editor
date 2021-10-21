import Command from "@lblod/ember-rdfa-editor/core/command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import EditorModel, {MutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import HTMLExportWriter from "@lblod/ember-rdfa-editor/core/writers/html-export-writer";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {putDataInClipboard} from "clipboard-plugin/util/put-data-in-clipboard";

export interface CopyCommandArgs {
  range?: ModelRange;
  event: ClipboardEvent;
}

export default class CopyCommand extends Command<[CopyCommandArgs], void> {

  name = "copy";
  private controller: EditorController;

  constructor(model: MutableModel, controller: EditorController) {
    super(model);
    this.controller = controller;
  }

  execute(_source: string, {range = this.model.selection.lastRange!, event}: CopyCommandArgs): void {
    //TODO remove cast
    const htmlExportWriter = new HTMLExportWriter(this.model as EditorModel);
    const modelNodes = this.controller.executeCommand("selection", {range, deleteSelection: false}) as ModelNode[];
    putDataInClipboard(event, modelNodes, htmlExportWriter);

  }
}
