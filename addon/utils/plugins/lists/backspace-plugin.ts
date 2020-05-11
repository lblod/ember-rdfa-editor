import { BackspacePlugin } from '../../ce/handlers/backspace-handler';
import { tagName } from '../../ce/dom-helpers';

export default class ListBackspacePlugin implements BackspacePlugin {
  label: 'backspace plugin for handling lists'

  allowManipulation(manipulation: Manipulation) : boolean {
    if (manipulation.type == "moveCursorBeforeElement") {
      const element = manipulation.node;
      if (tagName(element) == "li") {
        if (element.previousSibling && element.previousSibling.nodeType == Node.ELEMENT_NODE && tagName(element.previousSibling) == "li")
          return true;
        else
          return false;
      }
    }
    return true;
  }

  detectChange(manipulation: Manipulation) : boolean {
    return false;
  }
}
