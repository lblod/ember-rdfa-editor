import { BackspacePlugin,
         Editor,
         Manipulation,
         ManipulationGuidance,
         RemoveCharacterManipulation,
         moveCaretBefore,
         stringToVisibleText} from '../../ce/handlers/backspace-handler';
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
      else if (this.manipulationWillResultInTextNodeWithoutText(manipulation)) {
        return {
          allow: true,
          executor: this.removeTextNode
        }
      }
    }
    return null;
  }

  manipulationWillResultInTextNodeWithoutText(manipulation: RemoveCharacterManipulation) : boolean {
    const nodeText = manipulation.node.textContent || "";
    const position = manipulation.position;
    return stringToVisibleText(`${nodeText.slice(0, position)}${nodeText.slice( position + 1)}`).length == 0;
    }
  /**
   * This remove the text node completely
   */
  removeTextNode(manipulation: RemoveCharacterManipulation , editor: Editor) {
    const { node } = manipulation;
    const parentElement = node.parentElement;
    if (parentElement) {
      moveCaretBefore(node);
      node.remove();
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
