import SetPropertyCommand from "./set-property-command";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";

export default class MakeBoldCommand extends SetPropertyCommand<[ModelSelection]> {
  name = "make-bold";

  execute(executedBy: string, selection: ModelSelection = this.model.selection) {
    this.setProperty(executedBy, "bold", true, selection);
  }
}
