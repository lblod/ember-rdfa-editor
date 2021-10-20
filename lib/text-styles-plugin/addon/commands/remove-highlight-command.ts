import SetPropertyCommand from "text-styles-plugin/commands/set-property-command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";

export default class RemoveHighlightCommand extends SetPropertyCommand<[ModelRange | null]> {
  name = "remove-highlight";

  execute(executedBy: string, range: ModelRange | null = this.model.selection.lastRange) {
    this.setProperty(executedBy, "highlighted", false, range);
  }
}
