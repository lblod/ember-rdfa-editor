import SetPropertyCommand from "./set-property-command";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";

export default class MakeItalicCommand extends SetPropertyCommand {
  name = "make-italic";

  @logExecute
  execute(executedBy: string, selection: ModelSelection = this.model.selection) {
    super.setProperty(executedBy, "italic", true, selection);

  }
}
