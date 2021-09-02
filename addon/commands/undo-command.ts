import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default class UndoCommand extends Command {
  name = "undo";

  constructor(model: Model) {
    super(model, false);
  }

  execute(): void {
    this.model.restoreSnapshot();
  }
}
