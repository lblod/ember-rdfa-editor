import RemovePropertyCommand from "./remove-property-command";
import boldProperty from "../utils/rdfa/bold-property";
import { RawEditor } from "../editor/raw-editor";

export default class RemoveBoldCommand extends RemovePropertyCommand {
  name = "removeBold"
  constructor(editor: RawEditor) {
    super(editor, boldProperty);
  }

}
