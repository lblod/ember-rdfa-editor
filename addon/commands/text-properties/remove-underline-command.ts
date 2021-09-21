import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";

export default class RemoveUnderlineCommand extends SetPropertyCommand {
  name = "remove-underline";
  @logExecute
  execute(executedBy:string) {
    super.setProperty(executedBy, "underline", false);
  }
}
