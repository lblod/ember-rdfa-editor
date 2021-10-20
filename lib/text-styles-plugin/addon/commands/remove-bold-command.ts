import SetPropertyCommand from "text-styles-plugin/commands/set-property-command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";

export default class RemoveBoldCommand extends SetPropertyCommand<[ModelRange | null]> {
  name = "remove-bold";

  execute(executedBy: string, range: ModelRange | null = this.model.selection.lastRange) {
    super.setProperty(executedBy, "bold", false, range);
  }
}
