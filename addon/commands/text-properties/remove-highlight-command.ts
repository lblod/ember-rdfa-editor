import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

export default class RemoveHighlightCommand extends SetPropertyCommand {
  name = "remove-highlight"

  execute(selection?: ModelSelection) {
    this.setProperty("highlighted", false, selection);
  }
}
