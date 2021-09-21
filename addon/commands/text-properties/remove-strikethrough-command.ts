import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";

export default class RemoveStrikethroughCommand extends SetPropertyCommand {
  name = "remove-strikethrough";

  @logExecute
  execute(executedBy: string) {
    super.setProperty(executedBy, "strikethrough", false);
  }
}
