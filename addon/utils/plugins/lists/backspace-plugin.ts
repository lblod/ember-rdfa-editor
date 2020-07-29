import { MoveCursorBeforeElementManipulation,
         MoveCursorToEndOfNodeManipulation,
         ManipulationGuidance,
         Manipulation,
         Editor,
         RemoveEmptyElementManipulation,
         RemoveElementWithChildrenThatArentVisible,
         RemoveEmptyTextNodeManipulation,
       }  from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { BackspacePlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import { runInDebug } from '@ember/debug';
import { findLastLi } from '../../ce/dom-helpers';

//import { tagName } from '../../ce/dom-helpers';
function tagName(node: Node | null) : string {
  if(!node) return '';
  return node.nodeType === node.ELEMENT_NODE ? (node as Element).tagName.toLowerCase() : '';
}

function debug(message: String, object: Object | null = null) : void {
  runInDebug( () => {
    console.debug(`list backspace plugin: ${message}`, object);
  });
}

type ElementRemovalManipulation = RemoveEmptyElementManipulation | RemoveElementWithChildrenThatArentVisible
/**
 * This plugin provides sensible behaviour for backspace in lists.
 * NOTE: assumes a UL or OL has only list items as children elements.
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
      if (tagName(element) == "li") {
        return this.guidanceForJumpBeforeLi(element);
      }
    }
    else if (manipulation.type == "moveCursorToEndOfNode") {
      manipulation as MoveCursorToEndOfNodeManipulation;
      const element = manipulation.node;
      if (["ul","ol"].includes(tagName(element))) {
        return {
          allow: true,
          executor: this.jumpToLastLiOfList
        };
      }
    }
    else if (manipulation.type == "removeEmptyTextNode") {
      manipulation as RemoveEmptyTextNodeManipulation;
      const text = manipulation.node;
      const element = text.parentElement;
      if (tagName(element) == "li" && element?.firstChild == text) {
        return this.guidanceForJumpBeforeLi(element);
      }
    }
    return null;
  }

  guidanceForJumpBeforeLi(element: Element) : ManipulationGuidance {
    debug('providing guidance for jump before li');
    if (element.previousElementSibling && tagName(element.previousElementSibling) == "li") {
      return {
        allow: true,
        executor: this.mergeWithPreviousLi
      };
    }
    else if (! element.previousElementSibling && element.nextElementSibling) {
      return {
        allow: true,
        executor: this.removeListItemAndMoveContentBeforeList
      }
    }
    else {
      // this case: if (! element.previousElementSibling && ! element.nextElementSibling )
      return {
        allow: true,
        executor: this.removeListItemAndListButKeepContent
      }
    }
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

  /**
   * This is an executor provided to the backspace handler.
   * The executor assumes the cursor after a list and is moving inside the list
   * The executor will move the cursor to the end of the last list item in the list
   * @method jumpToLastLiOfList
   */
  jumpToLastLiOfList(manipulation: MoveCursorToEndOfNodeManipulation , editor: Editor) {
    const list = manipulation.node;
    if (["ul","ol"].includes(tagName(list))) {
      const li =findLastLi(list);
      if (li) {
        editor.setCarret(li, li.childNodes.length);
      }
      else {
        console.warn("no list item found in list");
      }
    }
    else {
      console.warn("element is not a list!");
    }
  }

  /**
   * This is an executor provided to the backspace handler.
   * The executor assumes the cursor starts from a non empty list item and that this item is the only item in the list
   * The executor will remove both list and list item, but keep the contents of the list item. the cursor will be positioned before the first child node of the list item.
   * @method removeListItemAndListButKeepContent
   */
  removeListItemAndListButKeepContent(manipulation: MoveCursorBeforeElementManipulation , editor: Editor) {
    const element = manipulation.node;
    const list = element.parentElement;
    if (list && ["ul","ol"].includes(tagName(list))) {
      if (list.parentElement) {
        const parentOfList = list.parentElement;
        editor.setCarret(list.parentElement, Array.from(parentOfList.childNodes).indexOf(list));
        list.replaceWith(...element.childNodes);
        editor.updateRichNode();
      }
      else {
        console.warn("list item has no parent element!");
      }
    }
    else {
      console.warn("parent of list item is not a list!");
    }
  }

  /**
   * This is an executor provided to the backspace handler.
   * The executor assumes the cursor starts from a non empty list item, that this item is the first item in the list and that other items exist.
   * The executor will move the contents of the first list item before the list and remove the list item. the cursor will be positioned before the first child node of the list item.
   * @method removeListItemAndMoveContentBeforeList
   */
  removeListItemAndMoveContentBeforeList(manipulation: MoveCursorBeforeElementManipulation , editor: Editor) {
    const element = manipulation.node;
    const list = element.parentElement;
    if (list && ["ul","ol"].includes(tagName(list))) {
      if (list.parentElement) {
        const firstChildOfListItem = element.childNodes[0];
        list.before(...element.childNodes);
        element.remove();
        editor.updateRichNode();
        const parentOfList = list.parentElement;
        const index = Array.from(parentOfList.childNodes).indexOf(firstChildOfListItem);
        editor.setCarret(parentOfList, index);
      }
      else {
        console.warn("list item has no parent element!");
      }
    }
    else {
      console.warn("parent of list item is not a list!");
    }
  }

  /**
   * This is an executor provided to the backspace handler.
   * The executor assumes the cursor starts from the beginning of a non empty list item and it has a previous list item it can merge into.
   * The executor will move the content of the list item to its previous sibling and position the cursor before the first child node of the list item (at the end of the original content of the previous sibling). the list item is removed.
   * @method mergeWithPreviousLi
   */
  mergeWithPreviousLi(manipulation: MoveCursorBeforeElementManipulation, editor: Editor) : void {
    const element = manipulation.node;
    if (element.previousElementSibling && tagName(element.previousElementSibling) == "li") {
      const previousLi = element.previousElementSibling;
      const firstChildOfListItem = element.childNodes[0];
      previousLi.append(...element.childNodes);
      element.remove();
      editor.updateRichNode();
      const index = Array.from(previousLi.childNodes).indexOf(firstChildOfListItem);
      editor.setCarret(previousLi, index);
    }
    else {
      console.warn("previous sibling is not a list item, can't execute merge");
    }
  }

  /**
   * This is an executor provided to the backspace handler.
   * The executor assumes the cursor starts from an empty list item and a previous list item exists
   * The executor will remove the list item and position the cursor at the end of the previous list item.
   * @method removeListItemAndMoveToPreviousListItem
   */
  removeListItemAndMoveToPreviousListItem(manipulation: ElementRemovalManipulation, editor: Editor) : void {
    const element = manipulation.node;
    const li = element.previousElementSibling;
    if (li == null) {
      console.warn('want to move to previous li, but that no longer exists');
    }
    else {
      editor.setCarret(li,li.childNodes.length);
      element.remove();
      editor.updateRichNode();
    }
  }

  /**
   * This is an executor provided to the backspace handler.
   * The executor assumes the cursor starts from the beginning of the first item of list with > 1 item. this item is empt
   * The executor will remove the item and position the cursor before the list
   * @method removeListItemAndJumpBeforeList
   */
  removeListItemAndJumpBeforeList(manipulation: ElementRemovalManipulation, editor: Editor) : void {
    const element = manipulation.node;
    const list = element.parentElement;
    if (list && ["ul","ol"].includes(tagName(list))) {
      if (list.parentElement) {
        editor.setCarret(list.parentElement, Array.from(list.parentElement.childNodes).indexOf(list));
        element.remove();
        editor.updateRichNode();
      }
      else {
        console.warn("list item has no parent element!");
      }
    }
    else {
      console.warn("parent of list item is not a list!");
    }
  }

  /**
   * This is an executor provided to the backspace handler.
   * The executor assumes the cursor starts at the beginning of a list item, the item is empty and it's the only item in the list
   * The executor will position the cursor before the list and remove the list
   * @method removeListItemAndList
   */
  removeListItemAndList(manipulation: ElementRemovalManipulation, editor: Editor) : void {
    const element = manipulation.node;
    const list = element.parentElement;
    if (list && ["ul","ol"].includes(tagName(list))) {
      if (list.parentElement) {
        editor.setCarret(list.parentElement, Array.from(list.parentElement.childNodes).indexOf(list));
        element.remove();
        list.remove();
        editor.updateRichNode();
      }
      else {
        console.warn("list item has no parent element!");
      }
    }
    else {
      console.warn("parent of list item is not a list!");
    }
  }

  /**
   * allows the plugin to notify the backspace handler a change has occured.
   * currently signals a change when an li has been removed during a "moveCursorBeforeElement" , "removeEmptyElement" or "removeElementWithChildrenThatArentVisible" manipulation.
   * @method detectChange
   */
  detectChange(manipulation: Manipulation) : boolean {
    if (["removeEmptyElement", "moveCursorBeforeElement", "removeElementWithChildrenThatArentVisible"].includes(manipulation.type)) {
      const element = manipulation.node;
      if (tagName(element) == "li") {
        if (element.parentNode == null) {
          // list item was removed
          return true;
        }
      }
    }
    return false;
  }
}
