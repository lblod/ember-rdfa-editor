import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";

export default class RemoveItalicCommand extends SetPropertyCommand {
  name = "remove-italic"
  execute() {
    super.execute("italic", false);
  }
}
