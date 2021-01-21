import Command from "../command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {Direction} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default abstract class SetPropertyCommand extends Command {
  constructor(model: Model) {
    super(model);
  }
  execute(property: TextAttribute, value: boolean, selection: ModelSelection = this.model.selection) {

    if(!ModelSelection.isWellBehaved(selection)) {
      console.info("Not executing SetPropertyCommand because selection is missing");
      return;
    }

    // get start and end regardless of selection direction
    const start = selection.lastRange.start;
    const end = selection.lastRange.end;


    const nodeFinder = new ModelNodeFinder({
     startNode: start.parent,
      endNode: end.parent,
      rootNode: this.model.rootModelNode,
      nodeFilter: ModelNode.isModelText,
      direction: Direction.FORWARDS
    });
    const nodes = Array.from(nodeFinder) as ModelText[];

    nodes[nodes.length - 1] = nodes[nodes.length - 1].split(end.parentOffset).left;
    nodes[0] = nodes[0].split(start.parentOffset).right;



    for (const node of nodes) {
      node.setTextAttribute(property, value);
    }

    if(selection.isCollapsed) {
      selection.selectNode(nodes[0]);
    } else {
      selection.anchor = ModelPosition.fromParent(this.model.rootModelNode, nodes[0], 0);
      const last = nodes[nodes.length - 1];
      selection.focus = ModelPosition.fromParent(this.model.rootModelNode, last, last.length);
    }

    this.model.write();
  }
}
