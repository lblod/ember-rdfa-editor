import EditorProperty from "../utils/ce/editor-property";
import { RawEditor } from "../editor/raw-editor";
import { cancelProperty } from "../utils/ce/property-helpers";
import Command from "./command";

export default abstract class RemovePropertyCommand extends Command {
  protected property: EditorProperty;
  constructor(editor: RawEditor, property: EditorProperty) {
    super(editor);
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
