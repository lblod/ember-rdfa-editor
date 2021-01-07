import Command from "../command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelIterator from "@lblod/ember-rdfa-editor/model/util/model-iterator";

export default abstract class SetPropertyCommand extends Command {
  constructor(model: Model) {
    super(model);
  }
  execute(property: TextAttribute, value: boolean) {
    const selection = this.model.selection;

    const nodeIterator = new ModelIterator<ModelText>(selection.anchor!, selection.focus!, (node => node instanceof ModelText));
    const nodes = Array.from(nodeIterator);

    nodes[nodes.length - 1] = nodes[nodes.length - 1].split(selection.focusOffset).left;
    nodes[0] = nodes[0].split(selection.anchorOffset).right;

    for (const node of nodes) {
      node.setTextAttribute(property, value);
    }

    if(selection.isCollapsed) {
      selection.selectNode(nodes[0]);
    } else {
      selection.setAnchor(nodes[0], 0);
      const last = nodes[nodes.length - 1];
      selection.setFocus(last, last.length);
    }

    if (selection.commonAncestor) {
      this.model.write(selection.commonAncestor);
    } else {
      throw new SelectionError("Selection without common ancestor");
    }
  }
}
