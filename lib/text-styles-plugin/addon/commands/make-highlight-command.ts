import SetPropertyCommand from "./set-property-command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";

export default class MakeHighlightCommand extends SetPropertyCommand<[ModelRange | null, boolean]> {
  name = "make-highlight";

  execute(executedBy: string, range: ModelRange | null = this.model.selection.lastRange, affectSelection = true) {
    this.setProperty(executedBy, "highlighted", true, range, affectSelection);
  }
}
