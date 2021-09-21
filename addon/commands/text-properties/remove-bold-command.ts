import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";
import { logExecute } from "@lblod/ember-rdfa-editor/utils/logging-utils";

export default class RemoveBoldCommand extends SetPropertyCommand {
  name = "remove-bold";

  @logExecute
  execute(executedBy: string) {
    super.setProperty(executedBy, "bold", false);
  }
}
