import {
  TabHandlerManipulation,
  TabInputPlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import { ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import {
  isList,
  isLI,
  getAllLisFromList,
  isEmptyList,
  siblingLis,
  findLastLi,
  isTextNode,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import {
  indentAction,
  unindentAction,
} from '@lblod/ember-rdfa-editor/utils/ce/list-helpers';
import { ensureValidTextNodeForCaret } from '@lblod/ember-rdfa-editor/editor/utils';
import PernetRawEditor from '@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor';

/**
 * Current behaviour
 * - case not first or last LI:
 *  - if cursor at at beginning of LI + (shift or shift + tab) indents or unindents
 *  - if cursor not at the end of LI jumps to next or previous LI
 * - else: jumps out of list
 * @class ListTabInputPlugin
 * @module plugin/lists
 */
export default class ListTabInputPlugin implements TabInputPlugin {
  label = 'Tab input plugin for handling List interaction';

  guidanceForManipulation(
    manipulation: TabHandlerManipulation
  ): ManipulationGuidance | null {
    if (manipulation.type === 'moveCursorToStartOfElement') {
      if (isList(manipulation.node)) {
        return { allow: true, executor: this.jumpIntoFirstLi };
      }
    } else if (
      manipulation.type === 'moveCursorAfterElement' &&
      isLI(manipulation.node)
    ) {
      // Some choices have been made. Let's try to follow more or less the most popular html editor.
      const listItem = manipulation.node as HTMLElement;

      // If cursor at beginning of LI, then do the indent.
      if (!manipulation.selection) {
        throw new Error('Manipulation has no selection');
      }

      if (
        manipulation.selection.anchorOffset === 0 &&
        manipulation.selection.anchorNode &&
        manipulation.selection.anchorNode.isSameNode(
          manipulation.node.firstChild
        )
      ) {
        return { allow: true, executor: this.indentLiContent };
      } else {
        const list = manipulation.node.parentElement as
          | HTMLUListElement
          | HTMLOListElement;
        const lastLi = findLastLi(list);

        if (lastLi && lastLi.isSameNode(listItem)) {
          return { allow: true, executor: this.jumpOutOfList };
        } else {
          return { allow: true, executor: this.jumpToNextLi };
        }
      }
    } else if (manipulation.type === 'moveCursorToEndOfElement') {
      if (isList(manipulation.node)) {
        return { allow: true, executor: this.jumpIntoLastLi };
      }
    } else if (
      manipulation.type === 'moveCursorBeforeElement' &&
      isLI(manipulation.node)
    ) {
      const listItem = manipulation.node as HTMLElement;
      // If cursor at beginning of LI, then do the unindent.
      // Note: this might be surprising and we also might want the cursor to be at the end of the LI.
      if (
        manipulation.selection &&
        manipulation.selection.anchorOffset === 0 &&
        manipulation.selection.anchorNode &&
        manipulation.selection.anchorNode.isSameNode(listItem.firstChild)
      ) {
        return { allow: true, executor: this.unindentLiContent };
      } else {
        const list = listItem.parentElement as
          | HTMLUListElement
          | HTMLOListElement;
        const firstLi = getAllLisFromList(list)[0];

        if (firstLi.isSameNode(listItem)) {
          return { allow: true, executor: this.jumpOutOfListToStart };
        } else {
          return { allow: true, executor: this.jumpToPreviousLi };
        }
      }
    }

    return null;
  }

  /**
   * Sets the cursor in the first <li></li>. If list is empty, creates an <li></li>.
   */
  jumpIntoFirstLi = (
    manipulation: TabHandlerManipulation,
    editor: PernetRawEditor
  ): void => {
    const list = manipulation.node as HTMLUListElement | HTMLOListElement;
    let firstLi;

    // This branch creates a new LI, but not really sure if we want that.
    if (isEmptyList(list)) {
      firstLi = document.createElement('li');
      list.append(firstLi);
    } else {
      firstLi = getAllLisFromList(list)[0];
    }

    setCursorAtStartOfLi(firstLi, editor);
  };

  /**
   * Sets the cursor in the last <li></li>. If list is empty, creates an <li></li>.
   */
  jumpIntoLastLi = (
    manipulation: TabHandlerManipulation,
    editor: PernetRawEditor
  ): void => {
    const list = manipulation.node as HTMLUListElement | HTMLOListElement;
    let lastLi;

    // This branch creates a new LI, but not really sure if we want that.
    if (isEmptyList(list)) {
      lastLi = document.createElement('li');
      list.append(lastLi);
    } else {
      const liList = getAllLisFromList(list);
      lastLi = liList[liList.length - 1];
    }

    setCursorAtEndOfLi(lastLi, editor);
  };

  /**
   * Creates nested list.
   * Note: Depends on list helpers from a long time ago.
   * TODO: Indent means the same as nested list, perhaps rename the action
   */
  indentLiContent = (
    _: TabHandlerManipulation,
    editor: PernetRawEditor
  ): void => {
    indentAction(editor); //TODO: this is legacy, this should be revisited.
  };

  /**
   * Merges nested list to parent list.
   * Note: Depends on list helpers from a long time ago.
   * TODO: Indent means the same as merge nested list, perhaps rename the action
   */
  unindentLiContent = (
    _: TabHandlerManipulation,
    editor: PernetRawEditor
  ): void => {
    unindentAction(editor); //TODO: this is legacy, this should be revisited.
  };

  /**
   * Jumps to next List item. Assumes there is one and current LI is not the last.
   */
  jumpToNextLi = (
    manipulation: TabHandlerManipulation,
    editor: PernetRawEditor
  ): void => {
    //Assumes the LI is not the last one
    const listItem = manipulation.node as HTMLLIElement;
    const listItems = siblingLis(listItem);
    const indexOfLi = listItems.indexOf(listItem);
    setCursorAtStartOfLi(listItems[indexOfLi + 1], editor);
  };

  /**
   * Jumps to next List item. Assumes there is one and current LI is not the first.
   */
  jumpToPreviousLi = (
    manipulation: TabHandlerManipulation,
    editor: PernetRawEditor
  ): void => {
    // Assumes the LI is not the last one
    const listItem = manipulation.node as HTMLLIElement;
    const listItems = siblingLis(listItem);
    const indexOfLi = listItems.indexOf(listItem);
    setCursorAtEndOfLi(listItems[indexOfLi - 1], editor);
  };

  /**
   * Jumps outside of list.
   */
  jumpOutOfList = (
    manipulation: TabHandlerManipulation,
    editor: PernetRawEditor
  ): void => {
    const element = manipulation.node.parentElement; // This is the list.
    if (!element) {
      throw new Error('Tab-input-handler expected list to be attached to DOM');
    }

    let textNode;
    if (element.nextSibling && isTextNode(element.nextSibling)) {
      textNode = element.nextSibling;
    } else {
      textNode = document.createTextNode('');
      element.after(textNode);
    }

    textNode = ensureValidTextNodeForCaret(textNode);
    editor.updateRichNode();
    editor.setCaret(textNode, 0);
  };

  /**
   * Jumps outside of at the start.
   */
  jumpOutOfListToStart = (
    manipulation: TabHandlerManipulation,
    editor: PernetRawEditor
  ): void => {
    const element = manipulation.node.parentElement; // This is the list.
    if (!element) {
      throw new Error('Tab-input-handler expected list to be attached to DOM');
    }

    let textNode;
    if (element.previousSibling && isTextNode(element.previousSibling)) {
      textNode = element.previousSibling;
    } else {
      textNode = document.createTextNode('');
      element.before(textNode);
    }

    textNode = ensureValidTextNodeForCaret(textNode);
    editor.updateRichNode();
    editor.setCaret(textNode, textNode.length);
  };
}

function setCursorAtStartOfLi(
  listItem: HTMLElement,
  editor: PernetRawEditor
): void {
  let textNode;
  if (listItem.firstChild && isTextNode(listItem.firstChild)) {
    textNode = listItem.firstChild;
  } else {
    textNode = document.createTextNode('');
    listItem.prepend(textNode);
  }

  textNode = ensureValidTextNodeForCaret(textNode);
  editor.updateRichNode();
  editor.setCaret(textNode, 0);
}

function setCursorAtEndOfLi(
  listItem: HTMLElement,
  editor: PernetRawEditor
): void {
  let textNode;
  if (listItem.lastChild && isTextNode(listItem.lastChild)) {
    textNode = listItem.lastChild;
  } else {
    textNode = document.createTextNode('');
    listItem.append(textNode);
  }

  textNode = ensureValidTextNodeForCaret(textNode);
  editor.updateRichNode();
  editor.setCaret(textNode, textNode.length);
}
