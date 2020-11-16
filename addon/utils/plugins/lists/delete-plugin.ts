import {
  DeletePlugin,
  MagicSpan,
} from "@lblod/ember-rdfa-editor/editor/input-handlers/delete-handler";
import {
  Manipulation,
  ManipulationGuidance,
  RemoveEmptyTextNodeManipulation,
  MoveCursorAfterElementManipulation,
  RemoveEmptyElementManipulation,
  RemoveElementWithChildrenThatArentVisible,
  MoveCursorToStartOfElementManipulation,
} from "@lblod/ember-rdfa-editor/editor/input-handlers/manipulation";
import { runInDebug } from "@ember/debug";
import {
  isLI,
  getParentLI,
  isList,
  isElement,
  removeNode,
} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {
  moveCaret,
  stringToVisibleText,
  hasVisibleChildren,
} from "@lblod/ember-rdfa-editor/editor/utils";
import { isInList } from "../../ce/list-helpers";

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
  hasChanged = false;

  guidanceForManipulation(
    manipulation: Manipulation
  ): ManipulationGuidance | null {
    if (manipulation.type === "moveCursorAfterElement") {
      return this.guidanceForMoveCursorAfterElement(manipulation);
    } else if (
      manipulation.type === "removeEmptyElement" ||
      manipulation.type === "removeElementWithChildrenThatArentVisible"
    ) {
      return this.guidanceForRemoveEmptyElement(manipulation);
    } else if (manipulation.type === "removeEmptyTextNode") {
      return this.guidanceForRemoveEmptyTextNode(manipulation);
    } else if (manipulation.type === "moveCursorToStartOfElement") {
      return this.guidanceForMoveCursorToStartOfElement(manipulation);
    }
    return null;
  }

  detectChange(): boolean {
    if (this.hasChanged) {
      this.hasChanged = false;
      return true;
    }
    return false;
  }
  /**
   * Cursor is positioned just before the end of an element which has visible children
   */
  private guidanceForMoveCursorAfterElement(
    manipulation: MoveCursorAfterElementManipulation
  ): ManipulationGuidance | null {
    if (isLI(manipulation.node)) {
      const dispatcher = (manipulation: MoveCursorAfterElementManipulation) => {
        this.mergeNextElement(manipulation.node);
      };
      return { allow: true, executor: dispatcher.bind(this) };
    } else {
      const parentLi = getParentLI(manipulation.node);

      if (parentLi) {
        //we are inside some element within a li
        if (manipulation.node.nextElementSibling) {
          const dispatcher = () => {
            moveCaret(manipulation.node.nextElementSibling!.childNodes[0], 0);
          };
          return { allow: true, executor: dispatcher.bind(this) };
        }
        const dispatcher = () => {
          this.mergeNextElement(parentLi);
        };
        return { allow: true, executor: dispatcher.bind(this) };
      }
      const nextElement = this.findNextNode(manipulation.node);
      if (isList(nextElement)) {
        // we are just before a list
        const dispatcher = (
          manipulation: MoveCursorAfterElementManipulation
        ) => {
          this.mergeNextChildOfList(manipulation.node, nextElement!);
        };
        return { allow: true, executor: dispatcher.bind(this) };
      }
    }
    return null;
  }

  /**
   * Cursor is positioned just before the end of an element which has no visible children
   */
  private guidanceForRemoveEmptyElement(
    manipulation:
      | RemoveEmptyElementManipulation
      | RemoveElementWithChildrenThatArentVisible
  ): ManipulationGuidance | null {
    if (isLI(manipulation.node)) {
      // we are inside an empty li
      const dispatcher = (manipulation: RemoveEmptyElementManipulation) => {
        this.mergeNextElement(manipulation.node);
      };
      return { allow: true, executor: dispatcher.bind(this) };
    }
    return null;
  }

  /**
   * Cursor is inside a textNode without any visible text
   */
  private guidanceForRemoveEmptyTextNode(
    manipulation: RemoveEmptyTextNodeManipulation
  ): ManipulationGuidance | null {
    const parent = manipulation.node.parentElement;
    if (!parent)
      throw new Error("Invariant violation: textnode without parent");
    if (isInList(manipulation.node)) {
      // we are inside an empty textnode inside of a li
      // so we need to handle this
      const dispatcher = (manipulation: RemoveEmptyTextNodeManipulation) => {
        this.deleteEmptyTextNodeInLi(manipulation.node);
      };
      return { allow: true, executor: dispatcher.bind(this) };
    } else {
      const nextElement = this.findNextNode(parent) as HTMLElement;
      if (isList(nextElement)) {
        const dispatcher = () => {
          parent.textContent = stringToVisibleText(parent.textContent || "");
          this.mergeNextChildOfList(parent, nextElement!);
        };
        return { allow: true, executor: dispatcher.bind(this) };
      }
    }

    return null;
  }
  /**
   * Cursor is at the end of a textNode that is a sibling of the element after it
   */
  private guidanceForMoveCursorToStartOfElement(
    manipulation: MoveCursorToStartOfElementManipulation
  ): ManipulationGuidance | null {
    if (isList(manipulation.node)) {
      const dispatch = (manipulation: MoveCursorAfterElementManipulation) => {
        const prevSib = manipulation.node.previousSibling;
        if (prevSib && isElement(prevSib)) {
          // this probably never happens, but I'm not sure
          this.mergeNextChildOfList(prevSib, manipulation.node);
        } else if (prevSib) {
          // we can use the same merging logic, but we have to merge with the parent
          this.mergeNextChildOfList(prevSib.parentElement!, manipulation.node);
        }
      };
      return { allow: true, executor: dispatch.bind(this) };
    }
    return null;
  }

  private deleteEmptyTextNodeInLi(textNode: Text) {
    // are we at the end of the li?
    const sibling = this.getNextSibling(textNode);
    if (sibling) {
      // there are more elements in this li
      // remove our node and move the cursor to the start of the next
      textNode.remove();
      moveCaret(sibling, 0);
    } else {
      // we are at the end of the li
      const parent = textNode.parentElement;
      if (!parent)
        throw new Error("Invariant violation: Textnode without parent");
      this.mergeNextElement(parent);
      textNode.remove();
    }
  }
  /**
   * Take the content of the first child of list and add it to element.
   * Then delete the child and, if the list is now empty, delete it.
   * @param element the element to merge into
   * @param list the list
   */
  private mergeNextChildOfList(element: Element, list: Element) {
    let firstChild: Element | null = list.children[0];
    while (
      firstChild &&
      !(isLI(firstChild) || hasVisibleChildren(firstChild))
    ) {
      let old = firstChild;
      firstChild = this.getNextElementSibling(old);
      old.remove();
    }
    if (!firstChild) {
      // empty ul
      list.remove();
      return;
    }
    // the most common case for this is starting with an empty document
    // any text will be just textNodes, and inserting a list will
    // insert it as a sibling to those nodes. This means we cannot simply append
    if (element === list.parentElement) {
      for (const node of firstChild.childNodes) {
        list.before(node);
      }
    } else {
      element.append(...firstChild.childNodes);
    }
    for (const node of firstChild.childNodes) {
      list.before(node);
    }
    firstChild.remove();
    if (list.childNodes.length === 0) {
      list.remove();
    }
    this.hasChanged = true;
  }
  /**
   * Generic method for merging the content of the element after the given element
   * into the given element
   */
  private mergeNextElement(element: Element) {
    // find the next element. This can be a sibling or a sibling of the parent
    const nextNode = this.findNextNode(element);
    if (!nextNode) return;
    if (isElement(nextNode)) {
      if (isList(nextNode)) {
        // next item is a list, this requires special handling because we need to merge with its first child
        this.mergeNextChildOfList(element, nextNode);
        return;
      }
      if (isLI(nextNode) || hasVisibleChildren(nextNode)) {
        this.hasChanged = true;
      }
      element.append(...nextNode.childNodes);
      nextNode.remove();
    } else {
      if (stringToVisibleText(nextNode.textContent || "").length > 0) {
        element.append(nextNode);
        this.hasChanged = true;
      } else {
        removeNode(nextNode as ChildNode);
      }
    }
  }
  /**
   * Find the next relevant element
   * This is broader than sibling, it can also be a sibling of the parent
   */
  private findNextNode(element: Element): Node | null {
    let rslt = this.getNextSibling(element);
    if (rslt) return rslt;

    const parent = element.parentElement;
    if (!parent) return null;
    rslt = this.getNextSibling(parent);
    return rslt;
  }

  /**
   * Magicspan-aware nextSibling
   */
  private getNextSibling(node: Node): Node | null {
    let next = node.nextSibling;
    while (this.isMagicSpan(next)) {
      next = next!.nextSibling;
    }
    return next;
  }
  /**
   * Magicspan-aware nextElementSibling
   */
  private getNextElementSibling(element: Element): Element | null {
    let next = element.nextElementSibling;
    while (this.isMagicSpan(next)) {
      next = next!.nextElementSibling;
    }
    return next;
  }
  private isMagicSpan(node?: Node | null) {
    return (
      node &&
      node.nodeType === node.ELEMENT_NODE &&
      (node as Element).id === MagicSpan.ID
    );
  }
}
