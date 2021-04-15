import SetPropertyCommand from "@lblod/ember-rdfa-editor/commands/text-properties/set-property-command";

export default class MakeUnderlineCommand extends SetPropertyCommand{
  name = 'make-underline';

  execute() {
    super.setProperty("underline", true);
  }
}
