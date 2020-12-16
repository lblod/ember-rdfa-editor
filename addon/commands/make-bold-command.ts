import SetPropertyCommand from "./set-property-command";
import { RawEditor } from "../editor/raw-editor";
import boldProperty from "../utils/rdfa/bold-property";

export default class MakeBoldCommand extends SetPropertyCommand {
  name = "make-bold"
  constructor(editor: RawEditor) {
    super(editor, boldProperty);
  }
}
