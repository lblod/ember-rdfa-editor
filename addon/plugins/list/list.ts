import { deleteTargetRange } from '@lblod/ember-rdfa-editor/input/utils';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ArrayUtils from '@lblod/ember-rdfa-editor/utils/array-utils';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';

export default class ListPlugin implements EditorPlugin {
  controller!: Controller;

  get name() {
    return 'list';
  }

  initialize(
    _transaction: Transaction,
    _controller: Controller,
    _options: unknown
  ): Promise<void> {
    this.controller = _controller;
    return Promise.resolve();
  }

  handleEvent(event: InputEvent) {
    switch (event.inputType) {
      case 'deleteContentBackward':
        return this.handleDelete(event, -1);
      case 'deleteContentForward':
        return this.handleDelete(event, 1);
      default:
        return { handled: false };
    }
  }

  handleDelete(event: InputEvent, direction: number) {
    const range = deleteTargetRange(this.controller.currentState, direction);
    if (range.collapsed && direction === -1) {
      const lis = [
        ...range.end.parent.findSelfOrAncestors(ModelNodeUtils.isListElement),
      ] as ModelElement[];
      const highestLi = lis[lis.length - 1];
      if (highestLi) {
        const topUl = highestLi.parent;
        //check if the li is just at the beginning of the document and adjust the start of the range accordingly

        if (topUl && ArrayUtils.all(range.start.path, (i) => i === 0)) {
          event.preventDefault();
          const start = ModelPosition.fromBeforeNode(topUl);
          this.controller.perform((tr) => {
            tr.commands.remove({ range: new ModelRange(start, range.end) });
          });
          return { handled: true };
        }
      }
    }
    const nodeAfter = range.end.nodeAfter();
    if (ModelNode.isModelElement(nodeAfter) && nodeAfter.type === 'li') {
      event.preventDefault();
      this.controller.perform((tr) => {
        tr.commands.remove({
          range: new ModelRange(
            range.start,
            ModelPosition.fromInNode(nodeAfter, 0)
          ),
        });
      });
      return {
        handled: true,
      };
    }
    return { handled: false };
  }
}
// TODO
//
// export default class ListTabInputPlugin implements TabInputPlugin {
//   label = 'Tab input plugin for handling List interaction';

//   guidanceForManipulation(
//     manipulation: TabHandlerManipulation
//   ): ManipulationGuidance | null {
//     if (manipulation.type === 'moveCursorToStartOfElement') {
//       if (isList(manipulation.node)) {
//         return { allow: true, executor: this.jumpIntoFirstLi };
//       }
//     } else if (
//       manipulation.type === 'moveCursorAfterElement' &&
//       isLI(manipulation.node)
//     ) {
//       // Some choices have been made. Let's try to follow more or less the most popular html editor.
//       const listItem = manipulation.node as HTMLElement;

//       // If cursor at beginning of LI, then do the indent.
//       if (!manipulation.selection) {
//         throw new Error('Manipulation has no selection');
//       }

//       if (
//         manipulation.selection.anchorOffset === 0 &&
//         manipulation.selection.anchorNode &&
//         manipulation.selection.anchorNode.isSameNode(
//           manipulation.node.firstChild
//         )
//       ) {
//         return { allow: true, executor: this.indentLiContent };
//       } else {
//         const list = manipulation.node.parentElement as
//           | HTMLUListElement
//           | HTMLOListElement;
//         const lastLi = findLastLi(list);

//         if (lastLi && lastLi.isSameNode(listItem)) {
//           return { allow: true, executor: this.jumpOutOfList };
//         } else {
//           return { allow: true, executor: this.jumpToNextLi };
//         }
//       }
//     } else if (manipulation.type === 'moveCursorToEndOfElement') {
//       if (isList(manipulation.node)) {
//         return { allow: true, executor: this.jumpIntoLastLi };
//       }
//     } else if (
//       manipulation.type === 'moveCursorBeforeElement' &&
//       isLI(manipulation.node)
//     ) {
//       const listItem = manipulation.node as HTMLElement;
//       // If cursor at beginning of LI, then do the unindent.
//       // Note: this might be surprising and we also might want the cursor to be at the end of the LI.
//       if (
//         manipulation.selection &&
//         manipulation.selection.anchorOffset === 0 &&
//         manipulation.selection.anchorNode &&
//         manipulation.selection.anchorNode.isSameNode(listItem.firstChild)
//       ) {
//         return { allow: true, executor: this.unindentLiContent };
//       } else {
//         const list = listItem.parentElement as
//           | HTMLUListElement
//           | HTMLOListElement;
//         const firstLi = getAllLisFromList(list)[0];

//         if (firstLi.isSameNode(listItem)) {
//           return { allow: true, executor: this.jumpOutOfListToStart };
//         } else {
//           return { allow: true, executor: this.jumpToPreviousLi };
//         }
//       }
//     }

//     return null;
//   }

//   /**
//    * Sets the cursor in the first <li></li>. If list is empty, creates an <li></li>.
//    */
//   jumpIntoFirstLi = (
//     manipulation: TabHandlerManipulation,
//     editor: Editor
//   ): void => {
//     const list = manipulation.node as HTMLUListElement | HTMLOListElement;
//     let firstLi;

//     // This branch creates a new LI, but not really sure if we want that.
//     if (isEmptyList(list)) {
//       firstLi = document.createElement('li');
//       list.append(firstLi);
//     } else {
//       firstLi = getAllLisFromList(list)[0];
//     }

//     setCursorAtStartOfLi(firstLi, editor);
//   };

//   /**
//    * Sets the cursor in the last <li></li>. If list is empty, creates an <li></li>.
//    */
//   jumpIntoLastLi = (
//     manipulation: TabHandlerManipulation,
//     editor: Editor
//   ): void => {
//     const list = manipulation.node as HTMLUListElement | HTMLOListElement;
//     let lastLi;

//     // This branch creates a new LI, but not really sure if we want that.
//     if (isEmptyList(list)) {
//       lastLi = document.createElement('li');
//       list.append(lastLi);
//     } else {
//       const liList = getAllLisFromList(list);
//       lastLi = liList[liList.length - 1];
//     }

//     setCursorAtEndOfLi(lastLi, editor);
//   };

//   /**
//    * Creates nested list.
//    * Note: Depends on list helpers from a long time ago.
//    * TODO: Indent means the same as nested list, perhaps rename the action
//    */
//   indentLiContent = (_: TabHandlerManipulation, editor: Editor): void => {
//     editor.executeCommand('indent-list', {});
//   };

//   /**
//    * Merges nested list to parent list.
//    * Note: Depends on list helpers from a long time ago.
//    * TODO: Indent means the same as merge nested list, perhaps rename the action
//    */
//   unindentLiContent = (_: TabHandlerManipulation, editor: Editor): void => {
//     editor.executeCommand('unindent-list', {});
//   };

//   /**
//    * Jumps to next List item. Assumes there is one and current LI is not the last.
//    */
//   jumpToNextLi = (
//     manipulation: TabHandlerManipulation,
//     editor: Editor
//   ): void => {
//     //Assumes the LI is not the last one
//     const listItem = manipulation.node as HTMLLIElement;
//     const listItems = siblingLis(listItem);
//     const indexOfLi = listItems.indexOf(listItem);
//     setCursorAtStartOfLi(listItems[indexOfLi + 1], editor);
//   };

//   /**
//    * Jumps to next List item. Assumes there is one and current LI is not the first.
//    */
//   jumpToPreviousLi = (
//     manipulation: TabHandlerManipulation,
//     editor: Editor
//   ): void => {
//     // Assumes the LI is not the last one
//     const listItem = manipulation.node as HTMLLIElement;
//     const listItems = siblingLis(listItem);
//     const indexOfLi = listItems.indexOf(listItem);
//     setCursorAtEndOfLi(listItems[indexOfLi - 1], editor);
//   };

//   /**
//    * Jumps outside of list.
//    */
//   jumpOutOfList = (
//     manipulation: TabHandlerManipulation,
//     editor: Editor
//   ): void => {
//     const element = manipulation.node.parentElement; // This is the list.
//     if (!element) {
//       throw new Error('Tab-input-handler expected list to be attached to DOM');
//     }

//     let textNode;
//     if (element.nextSibling && isTextNode(element.nextSibling)) {
//       textNode = element.nextSibling;
//     } else {
//       textNode = document.createTextNode('');
//       element.after(textNode);
//     }

//     textNode = ensureValidTextNodeForCaret(textNode);
//     window.getSelection()?.collapse(textNode, 0);
//     const tr = editor.state.createTransaction();
//     tr.readFromView(editor.view);
//     editor.dispatchTransaction(tr, false);
//   };

//   /**
//    * Jumps outside of at the start.
//    */
//   jumpOutOfListToStart = (
//     manipulation: TabHandlerManipulation,
//     editor: Editor
//   ): void => {
//     const element = manipulation.node.parentElement; // This is the list.
//     if (!element) {
//       throw new Error('Tab-input-handler expected list to be attached to DOM');
//     }

//     let textNode;
//     if (element.previousSibling && isTextNode(element.previousSibling)) {
//       textNode = element.previousSibling;
//     } else {
//       textNode = document.createTextNode('');
//       element.before(textNode);
//     }

//     textNode = ensureValidTextNodeForCaret(textNode);
//     window.getSelection()?.collapse(textNode, textNode.length);
//     const tr = editor.state.createTransaction();
//     tr.readFromView(editor.view);
//     editor.dispatchTransaction(tr, false);
//   };
// }

// function setCursorAtStartOfLi(listItem: HTMLElement, editor: Editor): void {
//   let textNode;
//   if (listItem.firstChild && isTextNode(listItem.firstChild)) {
//     textNode = listItem.firstChild;
//   } else {
//     textNode = document.createTextNode('');
//     listItem.prepend(textNode);
//   }

//   textNode = ensureValidTextNodeForCaret(textNode);
//   window.getSelection()?.collapse(textNode, 0);
//   const tr = editor.state.createTransaction();
//   tr.readFromView(editor.view);
//   editor.dispatchTransaction(tr, false);
// }

// function setCursorAtEndOfLi(listItem: HTMLElement, editor: Editor): void {
//   let textNode;
//   if (listItem.lastChild && isTextNode(listItem.lastChild)) {
//     textNode = listItem.lastChild;
//   } else {
//     textNode = document.createTextNode('');
//     listItem.append(textNode);
//   }

//   textNode = ensureValidTextNodeForCaret(textNode);
//   window.getSelection()?.collapse(textNode, textNode.length);
//   const tr = editor.state.createTransaction();
//   tr.readFromView(editor.view);
//   editor.dispatchTransaction(tr, false);
// }

// export class ListBackspaceDeleteInputPlugin implements BackspaceDeletePlugin {
//   label = 'Backspace/Delete plugin for handling rdfa in a range';
//   guidanceForManipulation(
//     manipulation: BackspaceDeleteHandlerManipulation,
//     editor: rawEditor
//   ): ManipulationGuidance | null {
//     const { range, direction } = manipulation;
//     if (range.collapsed && direction === -1) {
//       const lis = [
//         ...range.end.parent.findSelfOrAncestors(ModelNodeUtils.isListElement),
//       ] as ModelElement[];
//       const highestLi = lis[lis.length - 1];
//       if (highestLi) {
//         const topUl = highestLi.parent;
//         //check if the li is just at the beginning of the document and adjust the start of the range accordingly

//         if (topUl && ArrayUtils.all(range.start.path, (i) => i === 0)) {
//           const start = ModelPosition.fromBeforeNode(topUl);
//           return {
//             allow: true,
//             executor: () => {
//               editor.executeCommand('remove', new ModelRange(start, range.end));
//             },
//           };
//         }
//       }
//     }
//     const nodeAfter = range.end.nodeAfter();
//     if (ModelNode.isModelElement(nodeAfter) && nodeAfter.type === 'li') {
//       return {
//         allow: true,
//         executor: () => {
//           editor.executeCommand(
//             'remove',
//             new ModelRange(range.start, ModelPosition.fromInNode(nodeAfter, 0))
//           );
//         },
//       };
//     }
//     return null;
//   }
// }
// import {
//   MoveCursorToEndOfElementManipulation,
//   ManipulationGuidance,
//   RemoveEmptyElementManipulation,
//   RemoveElementWithChildrenThatArentVisible,
// } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
// import {
//   BackspaceHandlerManipulation,
//   BackspacePlugin,
// } from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
// import { runInDebug } from '@ember/debug';
// import {
//   findLastLi,
//   tagName,
// } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
// import { Editor } from '@lblod/ember-rdfa-editor/core/editor';

// function debug(message: string, object: unknown = null): void {
//   runInDebug(() => {
//     console.debug(`list backspace plugin: ${message}`, object);
//   });
// }

// type ElementRemovalManipulation =
//   | RemoveEmptyElementManipulation
//   | RemoveElementWithChildrenThatArentVisible;
// /**
//  * This plugin provides sensible behaviour for backspace in lists.
//  * NOTE: Assumes a UL or OL has only list items as children elements.
//  * TODO: Add MOAAAAR tests.
//  * @class ListBackspacePlugin
//  * @module plugin/lists
//  */
// export default class ListBackspacePlugin implements BackspacePlugin {
//   label = 'Backspace plugin for handling lists';

//   guidanceForManipulation(
//     manipulation: BackspaceHandlerManipulation
//   ): ManipulationGuidance | null {
//     if (
//       manipulation.type === 'removeEmptyElement' ||
//       manipulation.type === 'removeElementWithChildrenThatArentVisible'
//     ) {
//       // Removing an (empty-ish) list item.
//       manipulation;
//       const element = manipulation.node;
//       if (element && tagName(element) === 'li') {
//         return this.guidanceForRemoveListItem(element);
//       }
//     } else if (manipulation.type === 'moveCursorBeforeElement') {
//       manipulation;
//       const element = manipulation.node;
//       if (tagName(element) === 'li') {
//         return this.guidanceForJumpBeforeLi(element);
//       }
//     } else if (manipulation.type === 'moveCursorToEndOfElement') {
//       manipulation;
//       const element = manipulation.node;
//       if (['ul', 'ol'].includes(tagName(element))) {
//         return {
//           allow: true,
//           executor: this.jumpToLastLiOfList,
//         };
//       }
//     } else if (manipulation.type === 'removeEmptyTextNode') {
//       manipulation;
//       const text = manipulation.node;
//       const element = text.parentElement;
//       if (element && tagName(element) === 'li' && element.firstChild === text) {
//         return this.guidanceForJumpBeforeLi(element);
//       }
//     }

//     return null;
//   }

//   guidanceForJumpBeforeLi(element: Element): ManipulationGuidance {
//     debug('Providing guidance for jump before li');
//     if (
//       element.previousElementSibling &&
//       tagName(element.previousElementSibling) === 'li'
//     ) {
//       return {
//         allow: true,
//         executor: this.mergeWithPreviousLi,
//       };
//     } else if (!element.previousElementSibling && element.nextElementSibling) {
//       return {
//         allow: true,
//         executor: this.removeListItemAndMoveContentBeforeList,
//       };
//     } else {
//       // This case: if (!element.previousElementSibling && !element.nextElementSibling)
//       return {
//         allow: true,
//         executor: this.removeListItemAndListButKeepContent,
//       };
//     }
//   }

//   guidanceForRemoveListItem(element: Element): ManipulationGuidance {
//     if (
//       element.previousElementSibling &&
//       tagName(element.previousElementSibling) === 'li'
//     ) {
//       // There is an li before this item, so jump to the previous list item.
//       return {
//         allow: true,
//         executor: this.removeListItemAndMoveToPreviousListItem,
//       };
//     } else if (
//       element.nextElementSibling &&
//       tagName(element.nextElementSibling) === 'li'
//     ) {
//       // No li before, but there is an li after. List is not empty after removing the first li, so jump before list.
//       return {
//         allow: true,
//         executor: this.removeListItemAndJumpBeforeList,
//       };
//     } else {
//       // No li before and no li after, remove the list.
//       return {
//         allow: true,
//         executor: this.removeListItemAndList,
//       };
//     }
//   }

//   /**
//    * This is an executor provided to the backspace handler.
//    * The executor assumes the cursor after a list and is moving inside the list.
//    * The executor will move the cursor to the end of the last list item in the list.
//    * @method jumpToLastLiOfList
//    */
//   jumpToLastLiOfList = (
//     manipulation: MoveCursorToEndOfElementManipulation,
//     _editor: Editor
//   ) => {
//     const list = manipulation.node;
//     if (['ul', 'ol'].includes(tagName(list))) {
//       const li = findLastLi(list as HTMLUListElement | HTMLOListElement);
//       if (li) {
//         window.getSelection()?.collapse(li, li.childNodes.length);
//       } else {
//         console.warn('No list item found in list');
//       }
//     } else {
//       console.warn('Element is not a list');
//     }
//   };

//   /**
//    * This is an executor provided to the backspace handler.
//    * The executor assumes the cursor starts from a non empty list item and that this item is the only item in the list.
//    * The executor will remove both list and list item, but keep the contents of the list item.
//    * The cursor will be positioned before the first child node of the list item.
//    * @method removeListItemAndListButKeepContent
//    */
//   removeListItemAndListButKeepContent = (
//     manipulation: BackspaceHandlerManipulation,
//     editor: Editor
//   ) => {
//     let element;
//     if (manipulation.type === 'moveCursorBeforeElement') {
//       element = manipulation.node;
//     } else if (manipulation.type === 'removeEmptyTextNode') {
//       const textNode = manipulation.node;

//       if (textNode.parentElement) {
//         element = textNode.parentElement;
//       }
//     }

//     if (!element) {
//       console.warn(
//         'lists.backspace-plugin.removeListItemAndListButKeepContent: Unsupported manipulation or no valid element found.'
//       );
//     } else {
//       helpRemoveListItemAndListButKeepContent(element, editor);
//     }
//   };

//   /**
//    * This is an executor provided to the backspace handler.
//    * The executor assumes the cursor starts from a non empty list item, that this item is the first item in the list and that other items exist.
//    * The executor will move the contents of the first list item before the list and remove the list item.
//    * The cursor will be positioned before the first child node of the list item.
//    * @method removeListItemAndMoveContentBeforeList
//    */
//   removeListItemAndMoveContentBeforeList = (
//     manipulation: BackspaceHandlerManipulation,
//     editor: Editor
//   ) => {
//     let element;
//     if (manipulation.type === 'moveCursorBeforeElement') {
//       element = manipulation.node;
//     } else if (manipulation.type === 'removeEmptyTextNode') {
//       const textNode = manipulation.node;

//       if (textNode.parentElement) {
//         element = textNode.parentElement;
//       }
//     }

//     if (!element) {
//       console.warn(
//         'lists.backspace-plugin.removeListItemAndMoveContentBeforeList: Unsupported manipulation or no valid element found.'
//       );
//     } else {
//       helpRemoveListItemAndMoveContentBeforeList(element, editor);
//     }
//   };

//   /**
//    * This is an executor provided to the backspace handler.
//    * The executor assumes the cursor starts from the beginning of a non empty list item and it has a previous list item it can merge into.
//    * The executor will move the content of the list item to its previous sibling and position the cursor before the first child node of the list item (at the end of the original content of the previous sibling).
//    * The list item is removed.
//    * @method mergeWithPreviousLi
//    */
//   mergeWithPreviousLi = (
//     manipulation: BackspaceHandlerManipulation,
//     editor: Editor
//   ): void => {
//     let element;
//     if (manipulation.type === 'moveCursorBeforeElement') {
//       element = manipulation.node;
//     } else if (manipulation.type === 'removeEmptyTextNode') {
//       const textNode = manipulation.node;

//       if (textNode.parentElement) {
//         element = textNode.parentElement;
//       }
//     }

//     if (!element) {
//       console.warn(
//         'lists.backspace-plugin.mergeWithPreviousLi: Unsupported manipulation or no valid element found.'
//       );
//     } else {
//       helpMergeWithPreviousLi(element, editor);
//     }
//   };

//   /**
//    * This is an executor provided to the backspace handler.
//    * The executor assumes the cursor starts from an empty list item and a previous list item exists
//    * The executor will remove the list item and position the cursor at the end of the previous list item.
//    * @method removeListItemAndMoveToPreviousListItem
//    */
//   removeListItemAndMoveToPreviousListItem = (
//     manipulation: ElementRemovalManipulation,
//     editor: Editor
//   ): void => {
//     const element = manipulation.node;
//     const li = element.previousElementSibling;

//     if (li === null) {
//       console.warn('Want to move to previous li, but that no longer exists');
//     } else {
//       window.getSelection()?.collapse(li, li.childNodes.length);
//       element.remove();
//       const tr = editor.state.createTransaction();
//       tr.readFromView(editor.view);
//       editor.dispatchTransaction(tr, false);
//     }
//   };

//   /**
//    * This is an executor provided to the backspace handler.
//    * The executor assumes the cursor starts from the beginning of the first item of list with > 1 item.
//    * This item is empty.
//    * The executor will remove the item and position the cursor before the list.
//    * @method removeListItemAndJumpBeforeList
//    */
//   removeListItemAndJumpBeforeList = (
//     manipulation: ElementRemovalManipulation,
//     editor: Editor
//   ): void => {
//     const element = manipulation.node;
//     const list = element.parentElement;

//     if (list && ['ul', 'ol'].includes(tagName(list))) {
//       if (list.parentElement) {
//         window
//           .getSelection()
//           ?.collapse(
//             list.parentElement,
//             Array.from(list.parentElement.childNodes).indexOf(list)
//           );
//         element.remove();
//         const tr = editor.state.createTransaction();
//         tr.readFromView(editor.view);
//         editor.dispatchTransaction(tr, false);
//       } else {
//         console.warn('List item has no parent element');
//       }
//     } else {
//       console.warn('Parent of list item is not a list');
//     }
//   };

//   /**
//    * This is an executor provided to the backspace handler.
//    * The executor assumes the cursor starts at the beginning of a list item,
//    * the item is empty and it's the only item in the list.
//    * The executor will position the cursor before the list and remove the list.
//    * @method removeListItemAndList
//    */
//   removeListItemAndList = (
//     manipulation: ElementRemovalManipulation,
//     editor: Editor
//   ): void => {
//     const element = manipulation.node;
//     const list = element.parentElement;

//     if (list && ['ul', 'ol'].includes(tagName(list))) {
//       if (list.parentElement) {
//         window
//           .getSelection()
//           ?.collapse(
//             list.parentElement,
//             Array.from(list.parentElement.childNodes).indexOf(list)
//           );
//         element.remove();
//         list.remove();
//         const tr = editor.state.createTransaction();
//         tr.readFromView(editor.view);
//         editor.dispatchTransaction(tr, false);
//       } else {
//         console.warn('List item has no parent element');
//       }
//     } else {
//       console.warn('Parent of list item is not a list');
//     }
//   };

//   /**
//    * Allows the plugin to notify the backspace handler a change has occurred.
//    * Currently signals a change when an li has been removed during a "moveCursorBeforeElement" , "removeEmptyElement" or
//    * "removeElementWithChildrenThatArentVisible" manipulation.
//    * @method detectChange
//    */
//   detectChange(manipulation: BackspaceHandlerManipulation): boolean {
//     if (
//       [
//         'removeEmptyElement',
//         'moveCursorBeforeElement',
//         'removeElementWithChildrenThatArentVisible',
//       ].includes(manipulation.type)
//     ) {
//       const element = manipulation.node;
//       if (tagName(element) === 'li' && element.parentNode === null) {
//         // List item was removed.
//         return true;
//       }
//     }

//     return false;
//   }
// }

// /*************************************************************************************
//  * HELPERS
//  *************************************************************************************/

// function helpMergeWithPreviousLi(element: Element, editor: Editor): void {
//   if (
//     element.previousElementSibling &&
//     tagName(element.previousElementSibling) === 'li'
//   ) {
//     const previousLi = element.previousElementSibling;
//     const firstChildOfListItem = element.childNodes[0];

//     previousLi.append(...element.childNodes);
//     element.remove();

//     const index = Array.from(previousLi.childNodes).indexOf(
//       firstChildOfListItem
//     );
//     window.getSelection()?.collapse(previousLi, index);
//     const tr = editor.state.createTransaction();
//     tr.readFromView(editor.view);
//     editor.dispatchTransaction(tr, false);
//   } else {
//     console.warn("Previous sibling is not a list item, can't execute merge");
//   }
// }

// function helpRemoveListItemAndMoveContentBeforeList(
//   element: Element,
//   editor: Editor
// ): void {
//   const list = element.parentElement;
//   if (list && ['ul', 'ol'].includes(tagName(list))) {
//     if (list.parentElement) {
//       const firstChildOfListItem = element.childNodes[0];

//       list.before(...element.childNodes);
//       element.remove();

//       const parentOfList = list.parentElement;
//       const index = Array.from(parentOfList.childNodes).indexOf(
//         firstChildOfListItem
//       );
//       window.getSelection()?.collapse(parentOfList, index);
//       const tr = editor.state.createTransaction();
//       tr.readFromView(editor.view);
//       editor.dispatchTransaction(tr, false);
//     } else {
//       console.warn('List item has no parent element');
//     }
//   } else {
//     console.warn('Parent of list item is not a list');
//   }
// }

// function helpRemoveListItemAndListButKeepContent(
//   element: Element,
//   editor: Editor
// ) {
//   const list = element.parentElement;
//   if (list && ['ul', 'ol'].includes(tagName(list))) {
//     if (list.parentElement) {
//       const parentOfList = list.parentElement;
//       window
//         .getSelection()
//         ?.collapse(
//           list.parentElement,
//           Array.from(parentOfList.childNodes).indexOf(list)
//         );
//       list.replaceWith(...element.childNodes);
//       const tr = editor.state.createTransaction();
//       tr.readFromView(editor.view);
//       editor.dispatchTransaction(tr, false);
//     } else {
//       console.warn('List item has no parent element');
//     }
//   } else {
//     console.warn('Parent of list item is not a list');
//   }
// }
