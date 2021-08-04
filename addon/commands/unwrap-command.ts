import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

export default class UnwrapCommand extends Command {
  name = "unwrap";

  constructor(model: Model) {
    super(model);
  }

  execute(element: ModelElement): void {
    this.model.change(mutator => {
      mutator.unwrap(element);
    });
  }
}
