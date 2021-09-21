import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

export default class RemoveItalicCommand extends SetPropertyCommand {
  name = "remove-italic";
  @logExecute
  execute(executedBy: string, selection: ModelSelection = this.model.selection) {
    super.setProperty(executedBy, "italic", false, selection);
  }
}
