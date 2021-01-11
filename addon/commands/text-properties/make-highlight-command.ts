import SetPropertyCommand from "./set-property-command";

export default class MakeHighlightCommand extends SetPropertyCommand {
  name = "make-highlight"

  execute() {
    super.execute("highlighted", true);
  }
}
