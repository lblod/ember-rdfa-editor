import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";

export default class RemoveBoldCommand extends SetPropertyCommand {
  name = "remove-highlight"

  execute() {
    this.setProperty("highlighted", false);
  }
}
