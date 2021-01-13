import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";

export default class RemoveStrikethroughCommand extends SetPropertyCommand {
  name = "remove-strikethrough";

  execute() {
    super.execute("strikethrough", false);
  }
}
