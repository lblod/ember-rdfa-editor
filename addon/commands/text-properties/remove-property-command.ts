import EditorProperty from "../../utils/ce/editor-property";
import { cancelProperty } from "../../utils/ce/property-helpers";
import Command from "../command";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default abstract class RemovePropertyCommand extends Command {
  protected property: EditorProperty;
  constructor(model: Model, property: EditorProperty) {
    super(model);
    this.property = property;
  }
  execute() {
    cancelProperty(
      this.editor.selectCurrentSelection(),
      this.editor,
      this.property
    );
  }
}
