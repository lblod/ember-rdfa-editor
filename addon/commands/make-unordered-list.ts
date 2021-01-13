import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import { Direction } from "@lblod/ember-rdfa-editor/model/util/types";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/commands/command";

/**
 * command will convert all nodes in the selection to a list if they are not already in a list
 */
export default class MakeUnorderedListCommand extends Command {
  name = "make-unordered-list";
  constructor(model: Model) {
    super(model);
  }

  execute(selection?: ModelSelection) {
    if (!selection) {
      selection = this.model.selection;
    }

    const nodeFinder = new ModelNodeFinder({
      startNode: selection.anchor!,
      endNode: selection.focus!,
      rootNode: selection.commonAncestor!,
      direction: Direction.FORWARDS
    });
    const nodes = Array.from(nodeFinder) as ModelNode[];
    console.log(nodes);

  }
}
