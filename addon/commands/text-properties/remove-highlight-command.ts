export default class RemoveBoldCommand extends SetPropertyCommand {
  name = "remove-highlight"

  execute() {
    super.execute("highlighted", false);
  }
}
