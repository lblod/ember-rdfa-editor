import SetPropertyCommand from "./set-property-command";

export default class MakeItalicCommand extends SetPropertyCommand {
  name = "make-italic"

  execute() {
    super.setProperty("italic", true);

  }
}
