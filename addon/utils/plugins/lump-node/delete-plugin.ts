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
import { getCaretRect, setCaretOnPoint } from "../../dom-helpers";

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
    //TODO: fix case.manipulation.node == lumpnode
    const node = manipulation.node;
    const rootNode = node.getRootNode(); //Assuming here that node is attached.
    const isElementInLumpNode = isInLumpNode(node, rootNode);
    const isManipulationSupported = this.isSupportedManipulation(manipulation);

    if (isElementInLumpNode) {
      if (!isManipulationSupported) {
        console.warn(
          `plugins/lump-node/delete-plugin: manipulation ${manipulation.type} not supported for lumpNode`
        );
        return null;
      }
      return { allow: true, executor: this.deleteLumpExecutor.bind(this) };
    }

    return null;
  }
  detectChange(manipulation: Manipulation): boolean {
    const node = manipulation.node;
    if (!node.isConnected) {
      return true;
    }
    const rootNode = node.getRootNode();
    const isElementInLumpNode = isInLumpNode(node, rootNode);
    const isManipulationSupported = this.isSupportedManipulation(manipulation);
    if (isElementInLumpNode && isManipulationSupported) {
      return true;
    }
    return false;
  }
  private deleteLumpExecutor(manipulation: Manipulation, editor: Editor) {
    const rootNode = manipulation.node.getRootNode(); //Assuming here that node is attached.
    const parentLumpNode = getParentLumpNode(manipulation.node, rootNode)!;
    if (isLumpNodeFlaggedForRemoval(parentLumpNode)) {
      this.deleteLump(parentLumpNode, editor);
    } else {
      flagLumpNodeForRemoval(parentLumpNode);
    }
  }
  private deleteLump(node: Node, editor: Editor) {
    const rootNode = node.getRootNode();
    const lumpNode = getParentLumpNode(node, rootNode);
    const cursorRect = getCaretRect();
    lumpNode?.remove();
    editor.updateRichNode();
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
}
