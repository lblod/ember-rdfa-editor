import { BackspacePlugin,
         Editor,
         Manipulation,
         ManipulationGuidance,
         RemoveCharacterManipulation } from '../../ce/handlers/backspace-handler';
import { invisibleSpace } from '../../ce/dom-helpers';

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
          executor: this.removeLastCharFromTextNode
        }
      }
    }
    return null;
  }

  removeLastCharFromTextNode(manipulation: RemoveCharacterManipulation , editor: Editor) {
    const { node, position } = manipulation;
    node.textContent = invisibleSpace;
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
