import EditorProperty from "../../utils/ce/editor-property";
import Command from "../command";
import { applyProperty } from "../../utils/ce/property-helpers";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default abstract class SetPropertyCommand extends Command {
  protected property: EditorProperty;
  constructor(model: Model, property: EditorProperty) {
    super(model);
    this.property = property;
  }
  execute() {
    applyProperty(
      this.editor.selectCurrentSelection(),
      this.editor,
      this.property,
      false
    );
  }
}
