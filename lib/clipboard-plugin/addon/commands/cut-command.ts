import Command from "@lblod/ember-rdfa-editor/core/command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import EditorModel, {MutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import HTMLExportWriter from "@lblod/ember-rdfa-editor/core/writers/html-export-writer";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {putDataInClipboard} from "clipboard-plugin/util/put-data-in-clipboard";

export interface CutCommandArgs {
  range?: ModelRange;
  event: ClipboardEvent;
}

export default class CutCommand extends Command<[CutCommandArgs], void> {
  name = "cut";
  private controller: EditorController;

  constructor(model: MutableModel, controller: EditorController) {
    super(model);
    this.controller = controller;
  }

  execute(_source: string, {range = this.model.selection.lastRange!, event}: CutCommandArgs): void {
    //TODO remove cast
    const htmlExportWriter = new HTMLExportWriter(this.model as EditorModel);
    const modelNodes = this.controller.executeCommand("selection", {range, deleteSelection: true}) as ModelNode[];
    putDataInClipboard(event, modelNodes, htmlExportWriter);

  }


}
