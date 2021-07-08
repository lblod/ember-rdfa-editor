import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

export default class DeleteSelectionCommand extends Command<ModelNode[]> {
  name = "delete-selection-command";

  constructor(model: Model) {
    super(model);
  }

  execute(selection: ModelSelection = this.model.selection): ModelNode[] {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    let modelNodes: ModelNode[] = [];
    const range = selection.lastRange;
    const commonAncestor = range.getCommonAncestor();

    this.model.change(mutator => {
      let contentRange = mutator.splitRangeUntilElements(range, commonAncestor, commonAncestor);
      const treeWalker = new ModelTreeWalker({
        range: contentRange,
        descend: false
      });

      // Check if selection is inside table cell. If this is the case, cut children of said cell.
      // Assumption: if table cell is selected, no other nodes at the same level can be selected.
      const firstModelNode = treeWalker.currentNode;
      if (ModelNode.isModelElement(firstModelNode) && firstModelNode.type === "td") {
        contentRange = ModelRange.fromInNode(firstModelNode, 0, firstModelNode.getMaxOffset());
        modelNodes = [...firstModelNode.children];
      } else {
        modelNodes = [...treeWalker];
      }

      console.log(contentRange);
      selection.selectRange(mutator.insertNodes(contentRange));
    });

    return modelNodes;
  }

}
