import SetPropertyCommand from "./set-property-command";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

export default class MakeHighlightCommand extends SetPropertyCommand {
  name = "make-highlight"

  execute(selection?: ModelSelection) {
    this.setProperty("highlighted", true, selection);
  }
}
