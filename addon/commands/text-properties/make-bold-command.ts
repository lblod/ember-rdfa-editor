import SetPropertyCommand from "./set-property-command";
import boldProperty from "../../utils/rdfa/bold-property";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default class MakeBoldCommand extends SetPropertyCommand {
  name = "make-bold"
  constructor(model: Model) {
    super(model, boldProperty);
  }
}
