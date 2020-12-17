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
    const selection = this.model.selection.domSelection;

    if (selection.isCollapsed) {
      throw new NotImplementedError();
    }

    const strong = this.model.createElement("strong");
    this.model.surroundSelectionContents(strong);
  }
}
