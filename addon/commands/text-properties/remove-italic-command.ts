import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";

export default class RemoveItalicCommand extends SetPropertyCommand {
  name = "remove-italic";
  @logExecute
  execute() {
    super.setProperty("italic", false);
  }
}
