import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";

export default class RemoveUnderlineCommand extends SetPropertyCommand {
  name = "remove-underline";
  execute() {
    super.setProperty("underline", false);
  }
}
