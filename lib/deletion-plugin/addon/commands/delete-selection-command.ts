import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import SelectionCommand from "content-control-plugin/commands/selection-command";

export default class DeleteSelectionCommand extends SelectionCommand {
  name = "delete-selection";

  constructor(model: EditorModel) {
    super(model, true);
  }
}
