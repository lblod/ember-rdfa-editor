import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

export default class RemoveStrikethroughCommand extends SetPropertyCommand {
  name = "remove-strikethrough";

  @logExecute
  execute(executedBy: string, selection : ModelSelection = this.model.selection) {
    super.setProperty(executedBy, "strikethrough", false, selection);
  }
}
