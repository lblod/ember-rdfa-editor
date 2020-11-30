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
} from "../../ce/lump-node-utils";
import { getCaretRect, setCaretOnPoint } from "../../dom-helpers";

export default class LumpNodeDeletePlugin implements DeletePlugin {
  label = "Delete plugin for handling lump nodes";

  guidanceForManipulation(
    manipulation: Manipulation
  ): ManipulationGuidance | null {
    if (manipulation.type === "removeBoundaryBackwards") {
      return this.guidanceForRemoveBoundaryBackwards(manipulation);
    } else if (manipulation.type === "removeBoundaryForwards") {
      return this.guidanceForRemoveBoundaryForwards(manipulation);
    }

    return null;
  }
  detectChange(): boolean {
    return true;
  }
  private guidanceForRemoveBoundaryBackwards(
    manipulation: RemoveBoundaryBackwards
  ): ManipulationGuidance | null {
    if (hasLumpNodeProperty(manipulation.node)) {
      const executor = ((manipulation: RemoveBoundaryBackwards) => {
        this.handleDeleteBeforeLump(manipulation.node as HTMLElement);
      }).bind(this);

      return { allow: true, executor };
    }
    return null;
  }
  private guidanceForRemoveBoundaryForwards(
    manipulation: RemoveBoundaryForwards
  ): ManipulationGuidance | null {
    if (hasLumpNodeProperty(manipulation.node)) {
      const executor = ((
        manipulation: RemoveBoundaryBackwards,
        editor: Editor
      ) => {
        this.handleDeleteBeforeLump(manipulation.node as HTMLElement, editor);
      }).bind(this);
      return { allow: true, executor };
    }
    return null;
  }
  private handleDeleteBeforeLump(node: HTMLElement, editor: Editor) {
    if (isLumpNodeFlaggedForRemoval(node)) {
      this.deleteLump(node, editor);
    } else {
      flagLumpNodeForRemoval(node);
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
}
