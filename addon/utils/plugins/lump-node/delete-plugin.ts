import { DeletePlugin } from "@lblod/ember-rdfa-editor/editor/input-handlers/delete-handler";
import {
  Manipulation,
  RemoveBoundaryForwards,
  RemoveBoundaryBackwards,
  ManipulationGuidance,
  Editor,
} from "@lblod/ember-rdfa-editor/editor/input-handlers/manipulation";
import {
  hasLumpNodeProperty,
  flagLumpNodeForRemoval,
  getParentLumpNode,
  isLumpNodeFlaggedForRemoval,
  isInLumpNode,
} from "../../ce/lump-node-utils";
import {
  getCaretRect,
  setCaretOnPoint,
  findFirstAncestorWhichSatisfies,
  findDeepestFirstDescendant,
  getWindowSelection,
  isTextNode,
} from "../../dom-helpers";
import { RawEditor } from "@lblod/ember-rdfa-editor/editor/raw-editor";
import { moveCaretBefore } from "@lblod/ember-rdfa-editor/editor/utils";

const SUPPORTED_MANIPULATIONS = [
  "removeEmptyTextNode",
  "removeCharacter",
  "removeEmptyElement",
  "removeVoidElement",
  "moveCursorToEndOfElement",
  "moveCursorBeforeElement",
  "removeOtherNode",
  "removeElementWithOnlyInvisibleTextNodeChildren",
  "removeElementWithChildrenThatArentVisible",
  "removeBoundaryBackwards",
  "removeBoundaryForwards",
];

export default class LumpNodeDeletePlugin implements DeletePlugin {
  label = "Delete plugin for handling lump nodes";

  guidanceForManipulation(
    manipulation: Manipulation
  ): ManipulationGuidance | null {
    let node = manipulation.node;
    const rootNode = node.getRootNode(); //Assuming here that node is attached.
    if (manipulation.type === "removeCharacter") {
      const nextNode = this.findNextRelevantNode(node, rootNode);
      if (nextNode && isInLumpNode(nextNode, rootNode) && this.isInFrontOfLastChar()) {
        const executor = (_: Manipulation, editor: RawEditor) => {
          this.handleRemoveCharBeforeLump(node as Text, nextNode as ChildNode);
        };
        return { allow: true, executor };
      }
    }
    if (manipulation.type === "removeBoundaryForwards") {
      const nextNode = this.findNextRelevantNode(node, rootNode);
      if (!nextNode) {
        return null;
      } else {
        node = nextNode;
      }
    }
    const isElementInLumpNode = isInLumpNode(node, rootNode);
    const isManipulationSupported = this.isSupportedManipulation(manipulation);

    if (isElementInLumpNode) {
      if (!isManipulationSupported) {
        console.warn(
          `plugins/lump-node/delete-plugin: manipulation ${manipulation.type} not supported for lumpNode`
        );
        return null;
      }
      const executor = (_manipulation: Manipulation, editor: RawEditor) => {
        this.deleteLumpExecutor(node, rootNode);
      };
      return { allow: true, executor };
    }

    return null;
  }
  private deleteLumpExecutor(node: Node, rootNode: Node) {
    const parentLumpNode = getParentLumpNode(node, rootNode)!;
    if (isLumpNodeFlaggedForRemoval(parentLumpNode)) {
      this.deleteLump(parentLumpNode, rootNode);
    } else {
      flagLumpNodeForRemoval(parentLumpNode);
    }
  }
  private deleteLump(node: Node, rootNode: Node) {
    const lumpNode = getParentLumpNode(node, rootNode);
    const cursorRect = getCaretRect();
    lumpNode?.remove();
    setCaretOnPoint(
      cursorRect.right,
      cursorRect.bottom - cursorRect.height / 2
    );
  }
  /**
   * checks whether manipulation is supported
   * @method isSupportedManipulation
   */
  private isSupportedManipulation(manipulation: Manipulation): boolean {
    return SUPPORTED_MANIPULATIONS.some((m) => m === manipulation.type);
  }
  private findNextRelevantNode(node: Node, root: Node): Node | null {
    if (node.nextSibling) {
      return node.nextSibling;
    }
    const commonParent = findFirstAncestorWhichSatisfies(
      node,
      root,
      (visitedNode, previousNode) => {
        return !!previousNode && visitedNode.lastChild !== previousNode;
      }
    );
    if (!commonParent) {
      return null;
    }
    return findDeepestFirstDescendant(commonParent);
  }

  private handleRemoveCharBeforeLump(charNode: Text, lumpNode: ChildNode) {
    if (
      !charNode.textContent ||
      (charNode.textContent && charNode.textContent.length <= 1)
    ) {
      charNode.remove();
    } else {
      charNode.textContent = charNode.textContent!.substr(
        0,
        charNode.textContent.length - 2
      );
    }
    moveCaretBefore(lumpNode);
  }
  private isInFrontOfLastChar(): boolean {
    const selection = getWindowSelection();
    const caretNode = selection.anchorNode;
    if (caretNode && isTextNode(caretNode)) {
      return !!(
        caretNode.textContent &&
        selection.anchorOffset === caretNode.textContent.length - 1
      );
    }
    return false;
  }
}
