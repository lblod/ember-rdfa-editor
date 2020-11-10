import {
  DeletePlugin,
  MagicSpan,
} from "@lblod/ember-rdfa-editor/editor/input-handlers/delete-handler";
import {
  Manipulation,
  ManipulationGuidance,
  RemoveEmptyTextNodeManipulation,
  MoveCursorAfterElementManipulation,
  Editor,
  RemoveEmptyElementManipulation,
} from "@lblod/ember-rdfa-editor/editor/input-handlers/manipulation";
import { runInDebug } from "@ember/debug";
import {
  findLastLi,
  tagName,
  getWindowSelection,
} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {
  moveCaret,
  stringToVisibleText,
} from "@lblod/ember-rdfa-editor/editor/utils";

function debug(message: String, object: Object | null = null): void {
  runInDebug(() => {
    console.debug(`list delete plugin: ${message}`, object);
  });
}

/**
 * This plugin provides sensible behaviour for delete in lists.
 * @class ListDeletePlugin
 * @module plugin/lists
 */
export default class ListDeletePlugin implements DeletePlugin {
  label = "delete plugin for handling lists";
  changeRef?: Node;
  siblingsBeforeChange: number = -1;

  guidanceForManipulation(
    manipulation: Manipulation
  ): ManipulationGuidance | null {
    this.changeRef = manipulation.node.cloneNode(true);
    this.siblingsBeforeChange =
      manipulation.node.parentElement?.childElementCount ?? -1;
    if (manipulation.type == "moveCursorAfterElement") {
      manipulation as MoveCursorAfterElementManipulation;
      const element = manipulation.node;
      if (tagName(element) == "li") {
        return this.guidanceForDeleteAtEndOfLi(element);
      }
    } else if (manipulation.type == "removeEmptyElement") {
      manipulation as RemoveEmptyElementManipulation;
      const element = manipulation.node;
      if (tagName(element) == "li") {
        return this.guidanceForRemoveEmptyElement(element);
      }
    } else if (manipulation.type == "removeEmptyTextNode") {
      manipulation as RemoveEmptyTextNodeManipulation;
      const element = manipulation.node;
      const previousSibling = element.previousElementSibling;
      // debugger;
      if (tagName(element.parentElement) == "li") {
        manipulation.node = element.parentElement;
        this.changeRef = manipulation.node.cloneNode(true);
        this.siblingsBeforeChange =
          manipulation.node.parentElement?.childElementCount ?? -1;
        return this.guidanceForDeleteAtEndOfLi(element.parentElement);
      }
      if (["ul", "ol"].includes(tagName(previousSibling))) {
        return this.guidanceForRemoveEmptyTextNode(element);
      }
    }
    return null;
  }

  detectChange(manipulation: Manipulation): boolean {
    if (
      [
        "moveCursorAfterElement",
        "removeEmptyElement",
        "removeEmptyTextNode",
      ].includes(manipulation.type)
    ) {
      const element = manipulation.node as Element;
      debugger;
      if (!this.changeRef) return true;
      if (!element.parentElement) return true;
      if (
        this.siblingsBeforeChange !== element.parentElement?.childElementCount
      ) {
        return true;
      }
      return (
        stringToVisibleText(element.textContent || "") !==
        stringToVisibleText(this.changeRef.textContent || "")
      );
    }
    return false;
  }
  guidanceForRemoveEmptyTextNode(element: Element): ManipulationGuidance {
    debug(
      "providing guidance for removal of empty textnode where previous sibling is a list"
    );
    return { allow: true, executor: this.deleteEmptyAndMoveCursor };
  }

  guidanceForDeleteAtEndOfLi(element: Element): ManipulationGuidance {
    debug("providing guidance for delete at end of nonempty li");
    if (tagName(element.nextElementSibling) == "li") {
      return {
        allow: true,
        executor: this.mergeNextLi,
      };
    } else if (element.parentElement?.nextElementSibling) {
      return { allow: true, executor: this.mergeNextElementOutsideList };
    } else {
      return {
        allow: true,
        executor: this.moveCursorAfterList,
      };
    }
  }
  guidanceForRemoveEmptyElement(element: Element): ManipulationGuidance {
    debug("providing guidance for delete in empty li");
    if (tagName(element.nextElementSibling) == "li") {
      return {
        allow: true,
        executor: this.removeLi,
      };
    } else if (element.parentElement?.childNodes.length == 1) {
      return {
        allow: true,
        executor: this.removeEntireList,
      };
    } else {
      return {
        allow: true,
        executor: this.moveCursorAfterList,
      };
    }
  }
  deleteEmptyAndMoveCursor(manipulation: Manipulation, editor: Editor) {
    const textNode = manipulation.node as HTMLElement;
    const listBefore = textNode.previousElementSibling;
    const lastLi = listBefore?.lastElementChild as Node;
    textNode.remove();
    moveCaret(lastLi, 0);
  }
  moveCursorAfterList(manipulation: Manipulation, editor: Editor) {
    const currentLi = manipulation.node as HTMLLIElement;
    const parentList = currentLi.parentElement;
    if (parentList) {
      const afterList = parentList.nextElementSibling;
      if (afterList) {
        moveCaret(afterList, 0);
      }
    }
  }
  removeLi(manipulation: Manipulation, editor: Editor) {
    const currentLi = manipulation.node as HTMLLIElement;
    let nextSibling = currentLi.nextElementSibling;
    while (nextSibling && nextSibling.id === MagicSpan.ID) {
      nextSibling = nextSibling.nextElementSibling;
    }
    const selection = getWindowSelection();
    const parent = currentLi.parentElement;
    selection.empty();
    currentLi.remove();
    if (nextSibling && nextSibling.childNodes.length > 0) {
      selection.collapse(nextSibling.childNodes[0], 0);
    }
    editor.updateRichNode();
  }
  removeEntireList(manipulation: Manipulation, editor: Editor) {
    let currentLi = manipulation.node as HTMLLIElement;
    let parentList = currentLi.parentElement;
    if (parentList) {
      parentList.remove();
    }
    editor.updateRichNode();
  }
  mergeNextLi(manipulation: Manipulation, editor: Editor) {
    const currentLi = manipulation.node as HTMLLIElement;
    const nextLi = currentLi.nextElementSibling;
    if (!nextLi)
      throw new Error("Invariant violation: node has no nextElementSibling");

    currentLi.append(...nextLi.childNodes);
    nextLi.remove();
    editor.updateRichNode();
  }
  mergeNextElementOutsideList(manipulation: Manipulation, editor: Editor) {
    const currentLi = manipulation.node as HTMLLIElement;
    const parent = currentLi.parentElement;
    if (!parent) throw new Error("Invariant violation: node has no parent");
    const nextNode = parent.nextElementSibling;
    if (!nextNode) return;

    if (nextNode.textContent) {
      currentLi.append(...nextNode?.childNodes);
    }
    nextNode?.remove();
    editor.updateRichNode();
  }
  removeListItemAndList(manipulation: Manipulation, editor: Editor) {
    this.removeLi(manipulation, editor);
  }
}
