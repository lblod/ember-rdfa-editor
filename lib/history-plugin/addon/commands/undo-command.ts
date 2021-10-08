import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";

export default class UndoCommand extends Command<[], void> {
  name = "undo";

  constructor(model: EditorModel) {
    super(model, false);
  }

  execute(executedBy: string,): void {
    this.model.restoreSnapshot(executedBy);
  }
}
