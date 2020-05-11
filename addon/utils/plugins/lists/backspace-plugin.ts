import { MoveCursorBeforeElementManipulation, ManipulationGuidance, Manipulation, Editor } from '../../ce/handlers/backspace-handler';
import { BackspacePlugin } from '../../ce/handlers/backspace-handler';

//import { tagName } from '../../ce/dom-helpers';
function tagName(node: Node | null) : string {
  if(!node) return '';
  return node.nodeType === node.ELEMENT_NODE ? (node as Element).tagName.toLowerCase() : '';
}

export default class ListBackspacePlugin implements BackspacePlugin {
  label = 'backspace plugin for handling lists'

  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    if (manipulation.type == "moveCursorBeforeElement") {
      manipulation as MoveCursorBeforeElementManipulation;
      const element = manipulation.node;
      if (tagName(element) == "li" && tagName( element.previousSibling ) == "li" ) {
        return  {
          allow: true,
          executor: this.executeManipulation
        };
      }
    }
    return null;
  }

  detectChange(_manipulation: Manipulation) : boolean {
    return false;
  }

  executeManipulation( _manipulation: Manipulation, _editor: Editor ) : void {
    console.error("Execution for list backspace has not been implemented yet");
    return;
  }
}
