import { TextInputPlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/text-input-handler';
import { Editor,
         Manipulation,
         ManipulationGuidance,
         InsertTextIntoTextNodeManipulation,
         InsertTextIntoElementManipulation
       } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';

const NON_BREAKING_SPACE = '\u00A0';
/**
 * @class PlaceholderTextInputPlugin
 * @module plugins/placeholder-text
 */
export default class PlaceholderTextInputPlugin implements TextInputPlugin {
  label = 'text input plugin for handling RDFA specific logic';

  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    const node = manipulation.node;
    const parentNode = node.parentElement;
    if(parentNode && parentNode.classList.contains('mark-highlight-manual')) {
      return {
        allow: true,
        executor: this.replacePlaceHolder
      };
    }
    return null;
  }

  /**
   * This executor replaces the placeholder node with a text node containing the provided input
   * @method removePlaceholder
   */
  replacePlaceHolder = (manipulation: (InsertTextIntoTextNodeManipulation | InsertTextIntoElementManipulation), editor: Editor): void => {
    const node = manipulation.node;
    if (node.parentElement) {
      const parent = node.parentElement;
      const text = manipulation.text == " " ? NON_BREAKING_SPACE : manipulation.text;
      const textNode = document.createTextNode(text);
      parent.replaceWith(textNode);
      editor.updateRichNode();
      editor.setCaret(textNode, textNode.length);
    }
  };
}
