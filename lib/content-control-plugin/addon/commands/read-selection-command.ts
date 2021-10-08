import SelectionCommand from "content-control-plugin/commands/selection-command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";

export default class ReadSelectionCommand extends SelectionCommand {
  name = "read-selection";

  constructor(model: EditorModel) {
    super(model, false);
  }
}
