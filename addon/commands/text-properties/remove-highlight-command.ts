import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";

export default class RemoveHighlightCommand extends SetPropertyCommand {
  name = "remove-highlight";

  @logExecute
  execute(selection?: ModelSelection) {
    this.setProperty("highlighted", false, selection);
  }
}
