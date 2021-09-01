import {
  BackspaceHandlerManipulation,
  BackspacePlugin
} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import {Editor, Manipulation, ManipulationGuidance} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import {getParentLumpNode} from '@lblod/ember-rdfa-editor/utils/ce/lump-node-utils';

// We favour to be defensive in the stuff we accept.
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
];

/**
 *
 * @class LumpNodeBackspacePlugin
 * @module plugin/lump-node
 */
export default class LumpNodeBackspacePlugin implements BackspacePlugin {
  label = 'Backspace plugin for handling LumpNodes';

  guidanceForManipulation(manipulation: BackspaceHandlerManipulation): ManipulationGuidance | null {
    //TODO: Fix case.manipulation.node === lump node
    const node = manipulation.node;
    const rootNode = node.getRootNode() as HTMLElement; // Assuming here that node is attached.
    let parentLump = getParentLumpNode(node, rootNode);

    if (manipulation.type === "removeEmptyTextNode" && !parentLump) {
      const prevSibling = manipulation.node.previousSibling;
      if (prevSibling) {
        parentLump = getParentLumpNode(prevSibling, rootNode);
      }
    }

    if (!parentLump) {
      return null;
    }

    if (!this.isSupportedManipulation(manipulation)) {
      console.warn(
        `plugins/lump-node/backspace-plugin: manipulation ${manipulation.type} not supported for lumpNode`
      );

      return null;
    } else {
      if (this.isElementFlaggedForRemoval(parentLump)) {
        return {
          allow: true,
          executor: (_, editor: Editor) => {
            this.removeLumpNode(parentLump!, editor);
          }
        };
      } else {
        return {
          allow: true,
          executor: () => {
            this.flagForRemoval(parentLump!);
          }
        };
      }
    }
  }

  /**
   * This executor removes the LumpNode containing manipulation.node completely.
   * It assumes manipulation.node is located in a LumpNode.
   * @method removeLumpNode
   */
  removeLumpNode = (lumpNode: Element, editor: Editor): void => {
    const parentOfLumpNode = lumpNode.parentNode;
    if (!parentOfLumpNode) {
      throw new Error("Lump node doesn't have parent node");
    }

    const offset = Array.from(parentOfLumpNode.childNodes).indexOf(lumpNode);
    lumpNode.remove();
    editor.updateRichNode();
    editor.setCaret(parentOfLumpNode, offset);
  };

  /**
   * Allows the plugin to notify the backspace handler a change has occurred.
   * Returns true explicitly when it detects the manipulation.node is in LumpNode.
   *  This is the case when flag for removal has been set.
   * Other cases, we rely on the detectVisualChange from backspace handler
   * @method detectChange
   */
  detectChange(manipulation: BackspaceHandlerManipulation): boolean {
    if (!manipulation.node.isConnected) {
      return false;
    }

    // We always do a visual change in this plugin, so we need the exact same logic.
    // This could be solved more efficiently with state, but that is not recommended for handler plugins.
    return !!this.guidanceForManipulation(manipulation);
  }

  /**
   * Checks whether manipulation is supported.
   * @method isSupportedManipulation
   */
  isSupportedManipulation(manipulation: Manipulation): boolean {
    return SUPPORTED_MANIPULATIONS.some(m => m === manipulation.type);
  }

  /**
   * Checks whether element is flagged for removal.
   * @method isElementFlaggedForRemoval
   */
  isElementFlaggedForRemoval(element: Element): boolean {
    return element.getAttribute("data-flagged-remove") === "complete";
  }

  /**
   * Flags the LumpNode for removal.
   * @method flagForRemoval
   */
  flagForRemoval = (lumpNode: Element): void => {
    lumpNode.setAttribute("data-flagged-remove", "complete");
  };
}
