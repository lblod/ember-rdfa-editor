import SetPropertyCommand from "./set-property-command";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

export default class MakeBoldCommand extends SetPropertyCommand {
  name = "make-bold";

  @logExecute
  execute(executedBy: string, selection: ModelSelection = this.model.selection) {
    this.setProperty(executedBy, "bold", true, selection);
  }
}
