import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";

export default class MakeStrikethroughCommand extends SetPropertyCommand {
  name = "make-strikethrough";
  execute() {
    super.setProperty("strikethrough", true);
  }
}
