import SetPropertyCommand from "./set-property-command";
import italicProperty from "../../utils/rdfa/italic-property";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";

export default class MakeItalicCommand extends SetPropertyCommand {
  name = "make-italic"

  constructor(model: Model) {
    super(model, italicProperty);
  }

  execute() {
    const selection = this.model.selection.modelSelection;
    if (!selection.isCollapsed) {
      if (!selection.anchorElement || !selection.focusElement) {
        throw new SelectionError("uncollapsed selection without focus or anchor");
      }
      let cur = selection.anchorElement!;
      let to = selection.focusElement;
      if(cur === to) {
        cur = cur.split(selection.focusOffset).left;
        cur = cur.split(selection.anchorOffset).right;
        cur.setAttribute("italic", true);

      } else {

        cur = cur.split(selection.anchorOffset).right;
        to = to.split(selection.focusOffset).left;

        while (cur && cur !== to) {
          cur.setAttribute("italic", true);
          cur = cur.next;
        }
        to.setAttribute("italic", true);
      }

      this.model.selection.modelSelection.selectNode(to);
      this.model.selection.modelSelection.collapse(true);
      this.model.write(selection.commonAncestorContainer);

    } else {

      let result = selection.anchorElement;
      if(!result) {
        throw new SelectionError("collapsed selection without focus");

      }
      result = result.split(selection.anchorOffset).right;
      result = result.split(0).left;
      result?.setAttribute("italic", true);
      this.model.selection.modelSelection.selectNode(result);
      this.model.selection.modelSelection.collapse();

      this.model.write(result.parent!);

    }


  }
}
