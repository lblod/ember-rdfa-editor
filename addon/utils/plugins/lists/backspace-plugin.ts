import { MoveCursorBeforeElementManipulation, ManipulationGuidance, Manipulation, Editor, RemoveEmptyElementManipulation, RemoveElementWithChildrenThatArentVisible } from '../../ce/handlers/backspace-handler';
import { BackspacePlugin } from '../../ce/handlers/backspace-handler';

//import { tagName } from '../../ce/dom-helpers';
function tagName(node: Node | null) : string {
  if(!node) return '';
  return node.nodeType === node.ELEMENT_NODE ? (node as Element).tagName.toLowerCase() : '';
}

type ElementRemovalManipulation = RemoveEmptyElementManipulation | RemoveElementWithChildrenThatArentVisible
/**
 *
 * @class ListBackspacePlugin
 * @module plugin/lists
 */
export default class ListBackspacePlugin implements BackspacePlugin {
  label = 'backspace plugin for handling lists'

  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    if (manipulation.type == "removeEmptyElement" || manipulation.type == "removeElementWithChildrenThatArentVisible") {
      /*
       * removing an (empty-ish) list item
       */
      manipulation as ElementRemovalManipulation
      const element = manipulation.node;
      if (tagName(element) == "li") {
        return this.guidanceForRemoveListItem(element);
      }
    }
    else if (manipulation.type == "moveCursorBeforeElement") {
      manipulation as MoveCursorBeforeElementManipulation;
      const element = manipulation.node;
      if (tagName(element) == "li" && tagName( element.previousSibling ) == "li" ) {
        return  {
          allow: false,
          executor: undefined
        };
      }
    }
    return null;
  }

  guidanceForRemoveListItem(element: Element) : ManipulationGuidance {
    if (element.previousElementSibling && tagName(element.previousElementSibling) == "li") {
      // there is an li before this item, so jump to the previous list item
      return {
        allow: true,
        executor: this.removeListItemAndMoveToPreviousListItem
      }
    }
    else if (element.nextElementSibling && tagName(element.nextElementSibling) == "li") {
      // no li before, but there is an li after. list is not empty after removing the first li, so jump before list
      return {
        allow: true,
        executor: this.removeListItemAndJumpBeforeList
      }
    }
    else {
      // no li before and no li after, remove the list
      return {
        allow: true,
        executor: this.removeListItemAndList
      }
    }
  }

  removeListItemAndMoveToPreviousListItem(manipulation: ElementRemovalManipulation,editor: Editor) : void {
    const element = manipulation.node;
    const li = element.previousElementSibling;
    if (li == null) {
      console.warn('want to move to previous li, but that no longer exists');
    }
    else {
      editor.setCarret(li,li.childNodes.length);
    }
  }

  removeListItemAndJumpBeforeList(manipulation: ElementRemovalManipulation, editor: Editor) : void {
    
  }

  removeListItemAndList(manipulation: ElementRemovalManipulation, editor: Editor) : void {
    
  }

  detectChange(_manipulation: Manipulation) : boolean {
    return false;
  }

  executeManipulation( _manipulation: Manipulation, _editor: Editor ) : void {
    console.error("Execution for list backspace has not been implemented yet");
    return;
  }
}
