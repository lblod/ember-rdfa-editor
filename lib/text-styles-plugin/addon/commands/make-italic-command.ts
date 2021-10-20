import SetPropertyCommand from "./set-property-command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";

export default class MakeItalicCommand extends SetPropertyCommand<[ModelRange | null]> {
  name = "make-italic";

  execute(executedBy: string, range: ModelRange | null = this.model.selection.lastRange) {
    super.setProperty(executedBy, "italic", true, range);

  }
}
