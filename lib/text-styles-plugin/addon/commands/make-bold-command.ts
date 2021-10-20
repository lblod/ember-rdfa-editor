import SetPropertyCommand from "./set-property-command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";

export default class MakeBoldCommand extends SetPropertyCommand<[ModelRange | null]> {
  name = "make-bold";

  execute(executedBy: string, range: ModelRange | null = this.model.selection.lastRange) {
    this.setProperty(executedBy, "bold", true, range);
  }
}
