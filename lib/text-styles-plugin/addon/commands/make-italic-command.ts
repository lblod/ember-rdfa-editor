import SetPropertyCommand from "./set-property-command";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";

export default class MakeItalicCommand extends SetPropertyCommand<[ModelSelection]> {
  name = "make-italic";

  execute(executedBy: string, selection: ModelSelection = this.model.selection) {
    super.setProperty(executedBy, "italic", true, selection);

  }
}
