import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import SetPropertyCommand from "text-styles-plugin/commands/set-property-command";

export default class RemoveBoldCommand extends SetPropertyCommand<[ModelSelection]> {
  name = "remove-bold";

  execute(executedBy: string, selection: ModelSelection = this.model.selection) {
    super.setProperty(executedBy, "bold", false, selection);
  }
}
