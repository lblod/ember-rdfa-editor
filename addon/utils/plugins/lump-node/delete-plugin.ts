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
} from "../../dom-helpers";
import { RawEditor } from "@lblod/ember-rdfa-editor/editor/raw-editor";

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
    if (
      manipulation.type === "removeBoundaryForwards" ||
      (manipulation.type === "removeCharacter" &&
        manipulation.node.textContent?.length === 1)
    ) {
      const nextNode = this.findNextRelevantNode(node, rootNode);
      if (!nextNode) {
        return null;
      } else {
        node = nextNode;
        // TODO: this hack is a consequence of the way we eject the cursor from lumpNodes
        if (manipulation.type === "removeCharacter") {
          manipulation.node.remove();
        }
      }
    }
    const isElementInLumpNode = isInLumpNode(node, rootNode);
    const isManipulationSupported = this.isSupportedManipulation(manipulation);
    if (manipulation.type === "removeCharacter") {
      debugger;
    }

    if (isElementInLumpNode) {
      if (!isManipulationSupported) {
        console.warn(
          `plugins/lump-node/delete-plugin: manipulation ${manipulation.type} not supported for lumpNode`
        );
        return null;
      }
      const executor = (_manipulation: Manipulation, editor: RawEditor) => {
        this.deleteLumpExecutor(node, rootNode);
        editor.updateRichNode();
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
}
