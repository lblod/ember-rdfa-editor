import SetPropertyCommand from "./set-property-command";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";

export default class MakeHighlightCommand extends SetPropertyCommand<[ModelSelection, boolean]> {
  name = "make-highlight";

  execute(executedBy: string, selection: ModelSelection = this.model.selection, affectSelection = true) {
    this.setProperty(executedBy, "highlighted", true, selection, affectSelection);
  }
}
