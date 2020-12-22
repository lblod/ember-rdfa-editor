import SetPropertyCommand from "./set-property-command";
import boldProperty from "../../utils/rdfa/bold-property";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";

export default class MakeBoldCommand extends SetPropertyCommand {
  name = "make-bold"
  constructor(model: Model) {
    super(model, boldProperty);
  }
  execute() {
    const selection = this.model.selection.modelSelection;

    if (!selection.isCollapsed) {
      throw new NotImplementedError();
    }
    const anchorElement = selection.anchorElement;
    anchorElement.bold.enableIn([selection.anchorOffset, selection.anchorOffset]);
    this.model.write(anchorElement);

  }
}
