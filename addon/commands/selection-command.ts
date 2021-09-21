import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {ImpossibleModelStateError, MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import SimplifiedModel from "@lblod/ember-rdfa-editor/model/simplified-model";

/**
 * The core purpose of this command is to return a valid html structure that best represents
 * the selection. It splits where necessary to achieve this, but restores the
 * model by default.
 * Optionally, it can also delete the selected content before returning it.
 */
export default abstract class SelectionCommand extends Command<unknown[], ModelNode[]> {
  protected deleteSelection: boolean;

  protected constructor(model: Model, createSnapshot: boolean) {
    super(model, createSnapshot);
    this.deleteSelection = createSnapshot;
  }

  execute(executedBy: string, selection: ModelSelection = this.model.selection): ModelNode[] {
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

    // special cases:
    // either inside a list with CA the list container
    // or inside a list with CA the list item, but the list item is entirely surrounded with selection
    if (ModelNodeUtils.isListContainer(commonAncestor)
      || (ModelNodeUtils.isListElement(commonAncestor) && SelectionCommand.isElementFullySelected(commonAncestor, range))
    ) {
      const newAncestor = ModelNodeUtils.findAncestor(commonAncestor, node => !ModelNodeUtils.isListContainer(node));
      if (!newAncestor || !ModelElement.isModelElement(newAncestor)) {
        throw new ImpossibleModelStateError("No ancestor found that is not list container.");
      }

      commonAncestor = newAncestor;
    }

    this.model.change(executedBy, mutator => {
      let contentRange = mutator.splitRangeUntilElements(range, commonAncestor, commonAncestor);
      let treeWalker = new ModelTreeWalker({
        range: contentRange,
        descend: false
      });

      // Check if selection is inside table cell. If this is the case, cut children of said cell.
      // Assumption: if table cell is selected, no other nodes at the same level can be selected.
      const firstModelNode = treeWalker.currentNode;
      if (ModelNodeUtils.isTableCell(firstModelNode)) {
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
      this.model.restoreSnapshot(executedBy, buffer, false);
    }

    return modelNodes;
  }

  /**
   * Check if range perfectly surrounds element, e.g.:
   * <ul>|<li>foo</li>|</ul>
   * @param element
   * @param range
   * @private
   */
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
