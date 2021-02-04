import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

export default class IndentListCommand extends Command {
  name: string = "list-indent";

  constructor(model: Model) {
    super(model);
  }

  execute(selection: ModelSelection = this.model.selection): void {
  }

}
