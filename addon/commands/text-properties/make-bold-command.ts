import SetPropertyCommand from "./set-property-command";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";

export default class MakeBoldCommand extends SetPropertyCommand {
  name = "make-bold";

  @logExecute
  execute(executedBy: string) {
    this.setProperty(executedBy, "bold", true);
  }
}
