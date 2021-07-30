import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";

export default class UnindentListCommand extends Command {
  name = "unindent-list";

  constructor(model: Model) {
    super(model);
  }

  canExecute(selection: ModelSelection = this.model.selection): boolean {
    if (!ModelSelection.isWellBehaved(selection)) {
      return false;
    }

    // TODO: why is this not the same as below?
    // const treeWalker = ModelRangeUtils.findModelNodes(
    //   selection.lastRange,
    //   node => {
    //     const firstAncestorLi = ModelNodeUtils.findAncestor(node, ModelNodeUtils.isListElement);
    //     const secondAncestorLi = ModelNodeUtils.findAncestor(firstAncestorLi, ModelNodeUtils.isListElement);
    //
    //     return firstAncestorLi !== null && secondAncestorLi !== null;
    //   }
    // );
    // const test = [...treeWalker];

    const interestingLis = selection.findAllInSelection(
      {
        predicate: node => {
          const firstAncestorLi = ModelNodeUtils.findAncestor(node, ModelNodeUtils.isListElement);
          const secondAncestorLi = ModelNodeUtils.findAncestor(firstAncestorLi, ModelNodeUtils.isListElement);

          return firstAncestorLi !== null && secondAncestorLi !== null;
        }
      }
    );
    const result = interestingLis && [...interestingLis];

    return !!result?.length;
  }

  @logExecute
  execute(selection: ModelSelection = this.model.selection): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const range = selection.lastRange;
    const treeWalker = ModelRangeUtils.findModelNodes(
      range,
      ModelNodeUtils.isListElement
    );

    const elements: ModelElement[] = [];
    for (const node of treeWalker) {
      if (!ModelNodeUtils.isListElement(node)) {
        throw new Error("Current node is not a list element.");
      }
      elements.push(node);
    }

    if (elements.length === 0) {
      throw new SelectionError("The selection is not in a list.");
    }

    // Get the shallowest common ancestors.
    const lisToShift = this.relatedChunks(elements);
    if (lisToShift) {
      // Iterate over all found li elements.
      for (const li of lisToShift) {
        const parent = ModelNodeUtils.findAncestor(li, ModelNodeUtils.isListContainer);
        const grandParent = ModelNodeUtils.findAncestor(parent, ModelNodeUtils.isListElement);
        const greatGrandParent = ModelNodeUtils.findAncestor(grandParent, ModelNodeUtils.isListContainer);

        if (li && parent && grandParent && greatGrandParent) {
          // Remove node.
          const liIndex = li.index;
          parent.removeChild(li);

          if (grandParent.index === null) {
            throw new Error("Couldn't find index of grandparent li");
          }

          if (parent.length === 0) {
            // Remove parent ul/ol if node is only child.
            greatGrandParent.addChild(li, grandParent.index + 1);
            grandParent.removeChild(parent);
          } else {
            if (liIndex === null) {
              throw new Error("Couldn't find index of current li");
            }
            const split = parent.split(liIndex);

            // Remove empty uls.
            if (split.left.length === 0) {
              split.left.parent?.removeChild(split.left);
            }

            if (split.right.length === 0) {
              split.right.parent?.removeChild(split.right);
            }

            if (split.right.length > 0) {
              split.right.parent?.removeChild(split.right);
              li.addChild(split.right);
            }

            greatGrandParent.addChild(li, grandParent.index + 1);
          }
        }
      }
    }

    this.model.write();
    this.model.readSelection();
  }

  private relatedChunks(elementArray: ModelElement[], result: ModelElement[] = []): ModelElement[] {
    // Check that the li is nested.
    elementArray = elementArray.filter(element =>
      ModelNodeUtils.findAncestor(element, ModelNodeUtils.isListElement)
    );

    // Sort array, by depth, shallowest first.
    elementArray = elementArray.sort((a, b) => {
      return b.getOffsetPath().length - a.getOffsetPath().length;
    });

    // Use shallowest as base.
    const base = elementArray[0];
    result.push(base);

    // Compare all paths to see if base is parent.
    // Remove those that are related.
    for (let i = 0; i < elementArray.length; i++) {
      if (UnindentListCommand.areRelated(base, elementArray[i])) {
        elementArray.splice(i, 1);
      }
    }

    if (elementArray.length === 0) {
      // If empty return result with the elements that need to be shifted.
      return result;
    } else {
      // Otherwise some hot recursive action.
      this.relatedChunks(elementArray, result);
    }

    return result;
  }

  private static areRelated(base: ModelElement, compare: ModelElement): boolean{
    const basePath = base.getOffsetPath();
    const comparePath = compare.getOffsetPath();

    for (let i = 0; i < basePath.length; i++) {
      if (basePath[i] !== comparePath[i]) {
        return false;
      }
    }

    return true;
  }
}
