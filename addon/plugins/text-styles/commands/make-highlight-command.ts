import SetPropertyCommand from "./set-property-command";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";

export default class MakeHighlightCommand extends SetPropertyCommand {
  name = "make-highlight";

  @logExecute
  execute(executedBy: string, selection: ModelSelection = this.model.selection, affectSelection = true) {
    this.setProperty(executedBy, "highlighted", true, selection, affectSelection);
  }
}
