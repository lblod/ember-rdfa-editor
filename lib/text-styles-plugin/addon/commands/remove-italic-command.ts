import SetPropertyCommand from "text-styles-plugin/commands/set-property-command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";

export default class RemoveItalicCommand extends SetPropertyCommand<[ModelRange | null]> {
  name = "remove-italic";
  execute(executedBy: string, range: ModelRange | null = this.model.selection.lastRange) {
    super.setProperty(executedBy, "italic", false, range);
  }
}
