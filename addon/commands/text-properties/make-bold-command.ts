import SetPropertyCommand from "./set-property-command";

export default class MakeBoldCommand extends SetPropertyCommand {
  name = "make-bold"

  execute() {
    super.execute("bold", true);
  }
}
