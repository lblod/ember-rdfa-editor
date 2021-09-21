import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";

export default class MakeUnderlineCommand extends SetPropertyCommand{
  name = 'make-underline';

  @logExecute
  execute(executedBy: string) {
    super.setProperty(executedBy, "underline", true);
  }
}
