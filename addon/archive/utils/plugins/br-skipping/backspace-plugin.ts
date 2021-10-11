import {
  BackspaceHandlerManipulation,
  BackspacePlugin
} from '@lblod/ember-rdfa-editor/archive/editor/input-handlers/backspace-handler';
import {
  ManipulationGuidance,
  MoveCursorToEndOfElementManipulation
} from '@lblod/ember-rdfa-editor/archive/editor/input-handlers/manipulation';
import {moveCaretBefore, stringToVisibleText} from '@lblod/ember-rdfa-editor/archive/editor/utils';
import {isElement, isTextNode} from "@lblod/ember-rdfa-editor/archive/utils/dom-helpers";

function isBr(node: Node): boolean {
  return isElement(node) && node.tagName.toLowerCase() === "br";
}

/**
 * Not all brs are visible to the user and this plugin tries to prevent setting the cursor after a non visible br.
 * Setting the cursor at that location would create an extra line, which is odd.
 */
export default class BrSkippingBackspacePlugin implements BackspacePlugin {
  label = "This plugin jumps over brs where necessary";

  guidanceForManipulation(manipulation: BackspaceHandlerManipulation): ManipulationGuidance | null {
    if (manipulation.type === "moveCursorToEndOfElement") {
      const element = manipulation.node;
      if (window.getComputedStyle(element).display === "block") {
        const length = element.childNodes.length;
        if (length > 0 && isBr(element.childNodes[length - 1])) {
          // Last br in a block element is normally not visible, so jump before the br.
          return {
            allow: true,
            executor: this.moveCaretBeforeLastBrOfElement
          };
        }
      }
    }

    if (manipulation.type === "moveCursorBeforeElement") {
      const element = manipulation.node;
      if (window.getComputedStyle(element).display === "block") {
        // Moving before a block.
        let previousSibling = element.previousSibling;
        // TODO: This probably breaks things.
        // Jump over non visible text nodes.
        while (previousSibling
          && isTextNode(previousSibling)
          && stringToVisibleText(previousSibling.textContent || "").length === 0
        ) {
          previousSibling = previousSibling.previousSibling;
        }

        if (previousSibling && isBr(previousSibling)) {
          return {
            allow: true,
            executor: () => {
              this.moveCaretBeforeBr(previousSibling as HTMLElement);
            }
          };
        }
      }
    }

    return null;
  }

  /**
   * Executor that will move the cursor the br that is before the element.
   */
  moveCaretBeforeBr(br: HTMLElement) {
    moveCaretBefore(br);
  }

  /**
   * Executor that will move the cursor before the last br of the element.
   */
  moveCaretBeforeLastBrOfElement = (manipulation: MoveCursorToEndOfElementManipulation) => {
    const element = manipulation.node;
    moveCaretBefore(element.childNodes[element.childNodes.length - 1]);
  };

  /**
   * Allows the plugin to notify the backspace handler a change has occurred.
   * Currently never detects a change, but rather lets the backspace handler do detection.
   * @method detectChange
   */
  detectChange(): boolean {
    return false;
  }
}
