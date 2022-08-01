import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import ModelTreeWalker from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import {
  ImpossibleModelStateError,
  MisbehavedSelectionError,
} from '@lblod/ember-rdfa-editor/utils/errors';

export interface SelectionCommandArgs {
  selection?: ModelSelection;
}

/**
 * The core purpose of this command is to return a valid html structure that best represents
 * the selection. It splits where necessary to achieve this, but restores the
 * model by default.
 * Optionally, it can also delete the selected content before returning it.
 */
export default abstract class SelectionCommand
  implements Command<SelectionCommandArgs, ModelNode[]>
{
  protected deleteSelection: boolean;

  protected constructor(createSnapshot: boolean) {
    this.deleteSelection = createSnapshot;
  }
  canExecute(): boolean {
    return true;
  }

  execute(
    { transaction }: CommandContext,
    { selection = transaction.workingCopy.selection }: SelectionCommandArgs
  ): ModelNode[] {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    let modelNodes: ModelNode[] = [];
    const range = selection.lastRange;
    let commonAncestor = range.getCommonAncestor();

    // special cases:
    // either inside a list with CA the list container
    // or inside a list with CA the list item, but the list item is entirely surrounded with selection
    if (
      ModelNodeUtils.isListContainer(commonAncestor) ||
      (ModelNodeUtils.isListElement(commonAncestor) &&
        SelectionCommand.isElementFullySelected(commonAncestor, range))
    ) {
      const newAncestor = ModelNodeUtils.findAncestor(
        commonAncestor,
        (node) => !ModelNodeUtils.isListContainer(node)
      );
      if (!newAncestor || !ModelElement.isModelElement(newAncestor)) {
        throw new ImpossibleModelStateError(
          'No ancestor found that is not list container.'
        );
      }

      commonAncestor = newAncestor;
    }

    let contentRange = transaction.splitRangeUntilElements(
      range,
      commonAncestor,
      commonAncestor
    );
    let treeWalker = new ModelTreeWalker({
      range: contentRange,
      descend: false,
    });

    // Check if selection is inside table cell. If this is the case, cut children of said cell.
    // Assumption: if table cell is selected, no other nodes at the same level can be selected.
    const firstModelNode = treeWalker.currentNode;
    if (ModelNodeUtils.isTableCell(firstModelNode)) {
      contentRange = range;
      treeWalker = new ModelTreeWalker({
        range: contentRange,
        descend: false,
      });
    }
    modelNodes = [...treeWalker];

    if (this.deleteSelection) {
      transaction.selectRange(transaction.insertNodes(contentRange));
    } else {
      transaction.rollback();
    }
    // when deleteSelection is false, we simply don't dispatch the transaction
    // and the state will remain unchanged

    return modelNodes;
  }

  /**
   * Check if range perfectly surrounds element, e.g.:
   * <ul>|<li>foo</li>|</ul>
   * @param element
   * @param range
   * @private
   */
  private static isElementFullySelected(
    element: ModelElement,
    range: ModelRange
  ): boolean {
    let startPosition = range.start;
    while (
      startPosition.parent !== element &&
      startPosition.parentOffset === 0
    ) {
      startPosition = ModelPosition.fromBeforeNode(startPosition.parent);
    }

    if (startPosition.parentOffset !== 0) {
      return false;
    }

    let endPosition = range.end;
    while (
      endPosition.parent !== element &&
      endPosition.parentOffset === endPosition.parent.getMaxOffset()
    ) {
      endPosition = ModelPosition.fromAfterNode(endPosition.parent);
    }

    return endPosition.parentOffset === endPosition.parent.getMaxOffset();
  }
}
