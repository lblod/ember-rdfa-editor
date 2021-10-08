import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import SetPropertyCommand from "text-styles-plugin/commands/set-property-command";

export default class RemoveHighlightCommand extends SetPropertyCommand<[ModelSelection]> {
  name = "remove-highlight";

  execute(executedBy: string, selection: ModelSelection = this.model.selection) {
    this.setProperty(executedBy, "highlighted", false, selection);
  }
}
