import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {SimplifiedModel} from "@lblod/ember-rdfa-editor/model/model-history";

export default abstract class SelectionCommand extends Command<unknown[], ModelNode[]> {
  protected deleteSelection: boolean;

  protected constructor(model: Model, createSnapshot: boolean) {
    super(model, createSnapshot);
    this.deleteSelection = createSnapshot;
  }

  execute(selection: ModelSelection = this.model.selection): ModelNode[] {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    let buffer: SimplifiedModel | null = null;
    if (!this.deleteSelection) {
      buffer = this.model.createSnapshot();
    }

    let modelNodes: ModelNode[] = [];
    const range = selection.lastRange;
    let commonAncestor = range.getCommonAncestor();

    if (ModelNode.isModelElement(commonAncestor)) {
      if (commonAncestor.type === "ul" || (commonAncestor.type === "li" && SelectionCommand.isElementFullySelected(commonAncestor, range))) {
        const newAncestor = ModelNodeUtils.findAncestor(commonAncestor, node => ModelNode.isModelElement(node) && node.type !== "ul");

        if (!newAncestor) {
          throw new Error("No ancestor found");
        }
        commonAncestor = newAncestor;
      }
    }

    this.model.change(mutator => {
      let contentRange = mutator.splitRangeUntilElements(range, commonAncestor, commonAncestor);
      let treeWalker = new ModelTreeWalker({
        range: contentRange,
        descend: false
      });

      // Check if selection is inside table cell. If this is the case, cut children of said cell.
      // Assumption: if table cell is selected, no other nodes at the same level can be selected.
      const firstModelNode = treeWalker.currentNode;
      if (ModelNode.isModelElement(firstModelNode) && (firstModelNode.type === "th" || firstModelNode.type === "td")) {
        contentRange = range;
        treeWalker = new ModelTreeWalker({
          range: contentRange,
          descend: false
        });
      }

      modelNodes = [...treeWalker];

      if (this.deleteSelection) {
        selection.selectRange(mutator.insertNodes(contentRange));
      }
    }, this.deleteSelection);

    if (buffer) {
      // If `deleteSelection` is false, we will have stored a snapshot of the model right before the execution of this
      // command. This means we will enter this if-case. Since, we don't want the changes on the VDOM to get written
      // back in this case, we restore the stored model.
      this.model.restoreSnapshot(buffer, false);
    }

    return modelNodes;
  }

  private static isElementFullySelected(element: ModelElement, range: ModelRange): boolean {
    let startPosition = range.start;
    while (startPosition.parent !== element && startPosition.parentOffset === 0) {
      startPosition = ModelPosition.fromBeforeNode(startPosition.parent);
    }

    if (startPosition.parentOffset !== 0) {
      return false;
    }

    let endPosition = range.end;
    while (endPosition.parent !== element && endPosition.parentOffset === endPosition.parent.getMaxOffset()) {
      endPosition = ModelPosition.fromAfterNode(endPosition.parent);
    }

    return endPosition.parentOffset === endPosition.parent.getMaxOffset();
  }
}
