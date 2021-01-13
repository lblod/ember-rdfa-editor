import SetPropertyCommand from "./set-property-command";

export default class MakeItalicCommand extends SetPropertyCommand {
  name = "make-italic"

  execute() {
    super.execute("italic", true);

  }
}
