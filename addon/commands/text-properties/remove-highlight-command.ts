import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";

export default class RemoveHighlightCommand extends SetPropertyCommand {
  name = "remove-highlight";

  @logExecute
  execute(executedBy: string) {
    this.setProperty(executedBy, "highlighted", false);
  }
}
