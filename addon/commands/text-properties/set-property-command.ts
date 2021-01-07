import Command from "../command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";

export default abstract class SetPropertyCommand extends Command {
  constructor(model: Model) {
    super(model);
  }
  execute(property: TextAttribute, value: boolean) {
    const selection = this.model.selection;

    const nodeFinder = new ModelNodeFinder({
     startNode: selection.anchor!,
      endNode: selection.focus!,
      rootNode: selection.commonAncestor!,
      nodeFilter: ModelNode.isModelText,
      direction: Direction.FORWARDS
    });
    const nodes = Array.from(nodeFinder) as ModelText[];

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
