import Command from "@lblod/ember-rdfa-editor/commands/command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

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
    //     const firstAncestorLi = node.findAncestor(node => ModelNode.isModelElement(node) && node.type === "li", false);
    //     const secondAncestorLi = firstAncestorLi?.findAncestor(node => ModelNode.isModelElement(node) && node.type === "li", false);
    //
    //     return firstAncestorLi !== null && secondAncestorLi !== null;
    //   }
    // );
    // const result = [...treeWalker];

    const interestingLis = selection.findAllInSelection(
      {
        predicate: node => {
          const firstAncestorLi = node.findAncestor(node => ModelNode.isModelElement(node) && node.type === "li", false);
          const secondAncestorLi = firstAncestorLi?.findAncestor(node => ModelNode.isModelElement(node) && node.type === "li", false);

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
      (node: ModelNode) => ModelNode.isModelElement(node) && node.type === "li"
    );

    const elements: ModelElement[] = [];
    for (const node of treeWalker) {
      if (!ModelNode.isModelElement(node) || node.type !== "li") {
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
        const node = li;
        const parent = li.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='ul' || node.type=='ol'), false) as ModelElement;
        const grandParent = parent?.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='li'), false) as ModelElement;
        const greatGrandParent = grandParent?.findAncestor(node => ModelNode.isModelElement(node) && (node.type=='ul' || node.type=='ol'), false) as ModelElement;

        if (node && parent && grandParent && greatGrandParent) {
          // Remove node.
          const nodeIndex = node.index!;
          parent.removeChild(node);

          // Remove parent ul/ol if node is only child.
          if (parent.length === 0) {
            greatGrandParent.addChild(node, grandParent.index! + 1);
            grandParent.removeChild(parent);
          }
          else {
            const split = parent.split(nodeIndex);
            // Remove empty uls.
            split.left.length === 0 ? split.left.parent?.removeChild(split.left) : null;
            split.right.length === 0 ? split.right.parent?.removeChild(split.right) : null;

            if (split.right.length > 0) {
              split.right.parent?.removeChild(split.right);
              node.addChild(split.right);
            }

            greatGrandParent.addChild(node, grandParent.index! + 1);
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
      element.findAncestor(node => ModelNode.isModelElement(node) && (node.type === "li"), false)
    );

    // TODO: comparing indices or offset shouldn't matter
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

    // If empty return result with the elements that need to be shifted.
    if (elementArray.length === 0) {
      return result;
    }
    // Otherwise some hot recursive action.
    else{
      this.relatedChunks(elementArray, result);
    }

    return result;
  }

  private static areRelated(base: ModelElement, compare: ModelElement): boolean{
    // TODO: comparing indices or offset shouldn't matter
    // const basePath = base.getIndexPath();
    // const comparePath = compare.getIndexPath();

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
