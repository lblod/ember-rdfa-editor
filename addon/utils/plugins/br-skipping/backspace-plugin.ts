import {BackspacePlugin} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import {
  Manipulation,
  ManipulationGuidance,
  MoveCursorToEndOfElementManipulation
} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import {moveCaretBefore, stringToVisibleText} from '@lblod/ember-rdfa-editor/editor/utils';


function isBr(node: Node): boolean {
  return node.nodeType == Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() == "br";
}

/**
 * not all brs are visible to the user and this plugin tries to prevent setting the cursor after a non visible br
 * setting the cursor at that location would create an extra line, which is odd
 */
export default class BrSkippingBackspacePlugin implements BackspacePlugin {
  label = "This plugin jumps over brs where necessary";

  guidanceForManipulation(manipulation: Manipulation): ManipulationGuidance | null {
    if (manipulation.type == "moveCursorToEndOfElement") {
      const element = manipulation.node ;
      if (window.getComputedStyle(element).display == "block") {
        const length = element.childNodes.length;
        if (length > 0 && isBr(element.childNodes[length - 1])) {
          // last br in a block element is normally not visible, so jump before the br
          return {
            allow: true,
            executor: this.moveCaretBeforeLastBrOfElement
          };
        }
      }
    }
    if (manipulation.type == "moveCursorBeforeElement") {
      const element = manipulation.node ;
      if (window.getComputedStyle(element).display == "block") {
        // moving before a block
        let previousSibling = element.previousSibling;
        // jump over non visible text nodes (TODO: this probably breaks things)
        while (previousSibling && previousSibling.nodeType == Node.TEXT_NODE && stringToVisibleText(previousSibling.textContent || "").length == 0) {
          previousSibling = previousSibling.previousSibling;
        }
        if (previousSibling) {
          if (isBr(previousSibling)) {
            return {
              allow: true,
              executor: () => {
                this.moveCaretBeforeBr(previousSibling as HTMLElement);
              }
            };
          }
        }
      }
    }
    return null;
  }

  /**
   * executor that will move the cursor the br that is before the element
   */
  moveCaretBeforeBr(br: HTMLElement) {
    moveCaretBefore(br);
  }

  /**
   * executor that will move the cursor before the last br of the element
   */
  moveCaretBeforeLastBrOfElement(manipulation: MoveCursorToEndOfElementManipulation) {
    const element = manipulation.node;
    moveCaretBefore(element.childNodes[element.childNodes.length - 1]);
  }

  /**
   * allows the plugin to notify the backspace handler a change has occured.
   * currently never detects a change but rather lets the backspace handler do detection
   * @method detectChange
   */
  detectChange(): boolean {
    return false;
  }
}
