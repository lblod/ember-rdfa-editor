import { BackspacePlugin,
         Editor,
         Manipulation,
         ManipulationGuidance,
         RemoveCharacterManipulation } from '../../ce/handlers/backspace-handler';
/**
 * In some cases the browser acts a bit weird when we empty a text node. this plugin tries to handle these edge cases.
 * Specific reasons we do this:
 *  - chrome removes empty text nodes immediately after setting an empty textContent and firefox doesn't
 *  - firefox and chrome have issues showing the caret where we expect them in some edge cases (empty text node between blocks for example)
 */
export default class EmptyTextNodeBackspacePlugin implements BackspacePlugin {
  label = "backspace plugin for properly handling empty text nodes"
  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    if (manipulation.type == "removeCharacter") {
      if (manipulation.position == 0 && manipulation.node.textContent?.length == 1) {
        return {
          allow: true,
          executor: this.removeTextNode
        }
      }
    }
    return null;
  }

  /**
   * This remove the text node completely
   */
  removeTextNode(manipulation: RemoveCharacterManipulation , editor: Editor) {
    const { node } = manipulation;
    const parentElement = node.parentElement;
    if (parentElement) {
      const indexOfElement = Array.from(parentElement.childNodes).indexOf(node);
      node.remove();
      editor.setCarret(parentElement, indexOfElement); // place the cursor before the element
      editor.updateRichNode();
    }
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
