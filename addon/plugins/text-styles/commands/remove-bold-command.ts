import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";
import { logExecute } from "@lblod/ember-rdfa-editor/utils/logging-utils";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";

export default class RemoveBoldCommand extends SetPropertyCommand {
  name = "remove-bold";

  @logExecute
  execute(executedBy: string, selection: ModelSelection = this.model.selection) {
    super.setProperty(executedBy, "bold", false, selection);
  }
}
