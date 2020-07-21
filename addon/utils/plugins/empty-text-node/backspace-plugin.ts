import { BackspacePlugin,
         Editor,
         Manipulation,
         ManipulationGuidance,
         RemoveCharacterManipulation } from '../../ce/handlers/backspace-handler';
import { invisibleSpace } from '../../ce/dom-helpers';

/**
 * In some cases the browser acts a bit weird when we empty a text node. this plugin tries to handle these edge cases.
 */
export default class EmptyTextNodeBackspacePlugin implements BackspacePlugin {
  label = "backspace plugin for properly handling empty text nodes"
  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    if (manipulation.type == "removeCharacter") {
      if (manipulation.position == 0) {
        return {
          allow: true,
          executor: this.removeLastCharFromTextNode
        }
      }
    }
    return null;
  }

  removeLastCharFromTextNode(manipulation: RemoveCharacterManipulation , editor: Editor) {
    const { node, position } = manipulation;
    const nodeText = node.textContent || "";
    node.textContent = nodeText.slice(1);
    const previousSibling = node.previousSibling;
    if (previousSibling && node.previousElementSibling == previousSibling) {
      const previousElement = node.previousElementSibling as Element;
      if (getComputedStyle(previousElement, null).display == 'block') {
        console.debug('the previous sibling of this text node is a block, so we add a whitespace to the node to prevent browser weirdness');
        node.textContent = invisibleSpace;
      }
    }
    else if (previousSibling == null && node.parentElement) {
      const parent = node.parentElement as Element;
      if (parent.textContent?.length == 0 && parent.getBoundingClientRect().height < 3) {
        console.debug(`no more text in parent and it seems to no longer have a decent height`);
        node.textContent = invisibleSpace;
      }
    }
    editor.updateRichNode();
    editor.setCarret( node, position );

  }

  /**
   * allows the plugin to notify the backspace handler a change has occured.
   * currently never detects a change but rather lets the backspace handler do detection
   * @method detectChange
   */
  detectChange(_manipulation: Manipulation) : boolean {
    return false;
  }
}
