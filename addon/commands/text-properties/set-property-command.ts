import Command from "../command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

export default abstract class SetPropertyCommand extends Command {
  constructor(model: Model) {
    super(model);
  }
  execute(property: TextAttribute, value: boolean, selection: ModelSelection = this.model.selection) {

    if(!ModelSelection.isWellBehaved(selection)) {
      console.info("Not executing SetPropertyCommand because selection is missing");
      return;
    }
    const commonAncestor = selection.getCommonAncestor();
    if(!commonAncestor) {
      console.info("Not executing SetPropertyCommand because no common ancestor");
      return;
    }

    // get start and end regardless of selection direction
    const start = selection.lastRange.start;
    const end = selection.lastRange.end;


    const nodes = selection.lastRange.getTextNodes();

    nodes[nodes.length - 1] = nodes[nodes.length - 1].split(end.parentOffset).left;
    nodes[0] = nodes[0].split(start.parentOffset).right;



    for (const node of nodes) {
      node.setTextAttribute(property, value);
    }

    if(selection.isCollapsed) {
      selection.selectNode(nodes[0]);
    } else {
      const start = ModelPosition.fromParent(this.model.rootModelNode, nodes[0], 0);
      const last = nodes[nodes.length - 1];
      const end = ModelPosition.fromParent(this.model.rootModelNode, last, last.length);
      const newRange = new ModelRange(start, end);
      selection.selectRange(newRange);
    }

    this.model.write(commonAncestor.parentElement);
  }
}
