import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {ImpossibleModelStateError} from "@lblod/ember-rdfa-editor/util/errors";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/util/model-node-utils";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/util/model-tree-walker";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import SimplifiedModel from "@lblod/ember-rdfa-editor/core/simplified-model";

export interface SelectionCommandArgs {
  range?: ModelRange
  deleteSelection?: boolean
}

/**
 * The core purpose of this command is to return a valid html structure that best represents
 * the selection. It splits where necessary to achieve this, but restores the
 * model by default.
 * Optionally, it can also delete the selected content before returning it.
 */
export default class SelectionCommand extends Command<[SelectionCommandArgs?], ModelNode[]> {
  name = "selection";

  constructor(model: EditorModel) {
    super(model);
  }

  execute(executedBy: string, {
    range = this.model.selection.lastRange!,
    deleteSelection = false
  }: SelectionCommandArgs = {}): ModelNode[] {

    let buffer: SimplifiedModel | null = null;
    if (!deleteSelection) {
      buffer = this.model.createSnapshot();
    }

    let modelNodes: ModelNode[] = [];
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

      if (deleteSelection) {
        this.model.selection.selectRange(mutator.insertNodes(contentRange));
      }
    }, deleteSelection);

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
