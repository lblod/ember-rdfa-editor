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
    const range = selection.getRangeAt(0);
    const fragment = range.extractContents();
    const nodeIterator = this.model.createNodeIterator<Text>(fragment, NodeFilter.SHOW_TEXT);
    // we want to modify the nodes, so we have to exhaust the iterator first
    for(const node of [...nodeIterator]) {
      const strong = this.model.createElement("strong");
      strong.appendChild(node.cloneNode());
      node.replaceWith(strong);
    }
    range.insertNode(fragment);
  }
}
