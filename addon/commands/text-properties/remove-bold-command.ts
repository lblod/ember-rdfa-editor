import RemovePropertyCommand from "./remove-property-command";
import boldProperty from "../../utils/rdfa/bold-property";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default class RemoveBoldCommand extends RemovePropertyCommand {
  name = "remove-bold"
  constructor(model: Model) {
    super(model, boldProperty);
  }

}
