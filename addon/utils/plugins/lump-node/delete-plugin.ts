import { DeletePlugin } from "@lblod/ember-rdfa-editor/editor/input-handlers/delete-handler";
import {
  Manipulation,
  RemoveBoundaryForwards,
  RemoveBoundaryBackwards,
  ManipulationGuidance,
} from "@lblod/ember-rdfa-editor/editor/input-handlers/manipulation";
import {
  hasLumpNodeProperty,
  flagLumpNodeForRemoval,
  getParentLumpNode,
} from "../../ce/lump-node-utils";

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
      const executor = ((manipulation: RemoveBoundaryBackwards) => {
        this.handleDeleteBeforeLump(manipulation.node as HTMLElement);
      }).bind(this);
      return { allow: true, executor };
    }
    return null;
  }
  private handleDeleteBeforeLump(node: HTMLElement) {
    flagLumpNodeForRemoval(node);
  }
  private deleteLump(node: Node) {
    const rootNode = node.getRootNode();
    const lumpNode = getParentLumpNode(node, rootNode);

  }
}
