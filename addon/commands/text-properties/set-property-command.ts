import EditorProperty from "../../utils/ce/editor-property";
import Command from "../command";
import { RawEditor } from "../../editor/raw-editor";
import { applyProperty } from "../../utils/ce/property-helpers";

export default abstract class SetPropertyCommand extends Command {
  protected property: EditorProperty;
  constructor(editor: RawEditor, property: EditorProperty) {
    super(editor);
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
