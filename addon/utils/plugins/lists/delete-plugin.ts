import {
  DeletePlugin,
  MagicSpan,
} from "@lblod/ember-rdfa-editor/editor/input-handlers/delete-handler";
import {
  Manipulation,
  ManipulationGuidance,
  RemoveEmptyElementManipulation,
  RemoveElementWithChildrenThatArentVisible,
  RemoveBoundaryBackwards,
  RemoveBoundaryForwards,
} from "@lblod/ember-rdfa-editor/editor/input-handlers/manipulation";
import { runInDebug } from "@ember/debug";
import {
  isLI,
  isList,
  removeNode,
  getWindowSelection,
  isTextNode,
  tagName,
  getParentLI,
  isElement,
  unwrapElement,
} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {
  stringToVisibleText,
  hasVisibleChildren,
  moveCaretToEndOfNode,
} from "@lblod/ember-rdfa-editor/editor/utils";
import { isInList } from "../../ce/list-helpers";
import LegacyRawEditor from "@lblod/ember-rdfa-editor/utils/ce/legacy-raw-editor";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function debug(message: string, object: unknown = null): void {
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
    this.hasChanged = false;
    if (manipulation.type === "removeBoundaryBackwards") {
      return this.guidanceForRemoveBoundaryBackwards(manipulation);
    } else if (manipulation.type === "removeBoundaryForwards") {
      return this.guidanceForRemoveBoundaryForwards(manipulation);
    } else if (manipulation.type === "removeEmptyElement") {
      return this.guidanceForRemoveEmptyElement(manipulation);
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
  private guidanceForRemoveBoundaryBackwards(
    manipulation: RemoveBoundaryBackwards
  ): ManipulationGuidance | null {
    if (this.isAnyListNode(manipulation.node)) {
      const dispatch = (
        manipulation: RemoveBoundaryBackwards,
        editor: LegacyRawEditor
      ) => {
        this.mergeBackwards(manipulation.node, editor);
      };
      return { allow: true, executor: dispatch.bind(this) };
    }
    return null;
  }
  private guidanceForRemoveBoundaryForwards(
    manipulation: RemoveBoundaryForwards
  ): ManipulationGuidance | null {
    if (this.isAnyListNode(manipulation.node)) {
      const dispatch = (
        manipulation: RemoveBoundaryForwards,
        editor: LegacyRawEditor
      ) => {
        this.mergeForwards(manipulation.node, editor);
      };
      return { allow: true, executor: dispatch.bind(this) };
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
    if (this.isAnyListNode(manipulation.node)) {
      const dispatcher = (
        manipulation: RemoveEmptyElementManipulation,
        editor: LegacyRawEditor
      ) => {
        this.mergeForwards(manipulation.node, editor);
      };
      return { allow: true, executor: dispatcher.bind(this) };
    }
    return null;
  }

  /**
   * Merge our node into the previous node
   * @param node the node which will be merged into the previous one
   * @param editor The editor instance
   */
  private mergeBackwards(node: Node, editor: LegacyRawEditor) {
    const baseNode = this.findNodeBefore(node, editor.rootNode);
    const nodeToMerge = this.getDeepestFirstDescendant(node);

    if (!baseNode) {
      if (isLI(nodeToMerge)) {
        this.removeEmptyAncestors(nodeToMerge);
        this.hasChanged = true;
      }
      return;
    }
    const mergeNode = this.getDeepestLastDescendant(baseNode);
    let cursorPosition = 0;
    if (isTextNode(mergeNode) && mergeNode.textContent) {
      cursorPosition = mergeNode.textContent.length;
    }
    this.mergeNodes(mergeNode, nodeToMerge);

    this.repositionCursor(mergeNode, nodeToMerge, cursorPosition);
    editor.updateRichNode();
  }

  /**
   * Merge the next node with our node
   * @param node The node to merge into
   * @param editor The editor instance
   */
  private mergeForwards(node: Node, editor: LegacyRawEditor) {

    const mergeNode = this.getDeepestLastDescendant(node);
    let cursorPosition = 0;
    if (isTextNode(mergeNode) && mergeNode.textContent) {
      cursorPosition = mergeNode.textContent.length;
    }
    const targetNode = this.findNodeAfter(node, editor.rootNode);
    if (!targetNode) {
      // no node in front of us, no sense in looping 50 times
      this.hasChanged = true;
      return;
    }
    const nodeToMerge = this.getDeepestFirstDescendant(targetNode);
    this.mergeNodes(mergeNode, nodeToMerge);

    this.repositionCursor(mergeNode, nodeToMerge, cursorPosition);
    editor.updateRichNode();
  }

  /**
   * Reposition cursor after a merge
   * @param mergeNode The node to merge into
   * @param nodeToMerge the node which was merged into the mergeNode
   * @param cursorPosition The position of the cursor before the merge
   */
  private repositionCursor(
    mergeNode: Node,
    nodeToMerge: Node,
    cursorPosition: number
  ) {
    const selection = getWindowSelection();
    if (isTextNode(mergeNode)) {
      selection.collapse(mergeNode, cursorPosition);
    } else if (isTextNode(nodeToMerge)) {
      selection.collapse(nodeToMerge, cursorPosition);
    } else {
      moveCaretToEndOfNode(mergeNode);
    }
  }
  /**
   * Merge two nodes. This means the first textNode encountered in a DFS of nodeToMerge will be appended to
   * the last textNode of mergeNode
   */
  private mergeNodes(mergeNode: Node, nodeToMerge: Node) {
    if (isTextNode(mergeNode)) {
      if (isTextNode(nodeToMerge)) {
        this.mergeTextNodes(mergeNode, nodeToMerge);
      } else if (isElement(nodeToMerge)) {
        this.mergeNodeElement(mergeNode, nodeToMerge);
      }
    } else if (isElement(mergeNode)) {
      if (isTextNode(nodeToMerge)) {
        this.mergeElementNode(mergeNode, nodeToMerge);
      } else if (isElement(nodeToMerge)) {
        this.mergeElements(mergeNode, nodeToMerge);
      }
    }
  }
  private mergeTextNodes(mergeNode: Text, nodeToMerge: Text) {
    const parent = nodeToMerge.parentElement!;
    this.concatenateNodes(mergeNode, nodeToMerge);

    if (stringToVisibleText(nodeToMerge.textContent || "")) {
      this.hasChanged = true;
    }
    removeNode(nodeToMerge);
    this.removeEmptyAncestors(parent);
  }

  private mergeElements(mergeEl: Element, elToMerge: Element) {
    if (mergeEl.contains(elToMerge)) {
      unwrapElement(elToMerge as HTMLElement);
    } else {
      mergeEl.append(...elToMerge.childNodes);
    }
    if (isLI(elToMerge) || tagName(elToMerge) === "br") {
      this.hasChanged = true;
    }
    this.removeEmptyAncestors(elToMerge);
  }
  private mergeNodeElement(mergeNode: Text, elToMerge: Element) {
    const [firstNode, ...rest] = elToMerge.childNodes;
    if (firstNode && isTextNode(firstNode)) {
      this.concatenateNodes(mergeNode, firstNode);
      mergeNode.after(...rest);
    } else {
      mergeNode.after(...elToMerge.childNodes);
    }
    elToMerge.innerHTML = "";
    if (isLI(elToMerge) || tagName(elToMerge) === "br") {
      this.hasChanged = true;
    }
    this.removeEmptyAncestors(elToMerge);
  }
  private mergeElementNode(mergeEl: Element, nodeToMerge: Text) {
    const parent = nodeToMerge.parentElement!;
    mergeEl.appendChild(nodeToMerge);
    if (stringToVisibleText(nodeToMerge.textContent || "")) {
      this.hasChanged = true;
    } else {
      removeNode(nodeToMerge);
    }
    this.removeEmptyAncestors(parent);
  }
  /**
   * Find the first node after node.
   * Searches up the tree until it encouters root or the node
   * has a sibling.
   * Skips magicspans.
   * @param node The node from which to start looking
   * @param root When we encounter this node, stop looking
   * @returns The node after this node, or null if there is none
   * */
  private findNodeAfter(node: Node, root: Node): Node | null {
    if (node === root) {
      return null;
    }
    let sib = this.getNextSibling(node);
    if (sib) {
      return sib;
    }
    let parent = node.parentNode;
    while (!sib && parent && parent !== root) {
      sib = this.getNextSibling(parent);
      parent = parent.parentNode;
    }
    return sib;
  }
  /**
   * Find the first node before node.
   * Searches up the tree until it encouters root or the node
   * has a sibling.
   * @param node The node from which to start looking
   * @param root When we encounter this node, stop looking
   * @returns The node before this node, or null if there is none
   * */
  private findNodeBefore(node: Node, root: Node): Node | null {
    if (node === root) {
      return null;
    }
    let sib = node.previousSibling;
    if (sib) {
      return sib;
    }
    let parent = node.parentNode;
    while (!sib && parent && parent !== root) {
      sib = parent.previousSibling;
      parent = parent.parentNode;
    }
    return sib;
  }

  /**
   * Concatenate two textnodes
   * After the operation, the left node will contain
   * the textContent of left and right, concatenated.
   * The right node will be removed.
   * @param left the left node
   * @param right the right node
   * */
  private concatenateNodes(left: Text, right: Text) {
    if (left.textContent) {
      if (right.textContent) {
        left.textContent += right.textContent;
      }
    } else {
      left.textContent = right.textContent;
    }
  }

  /**
   * Go as deep as possible, looking at the lastChild
   * of the node at every step. Stop when we found a
   * textNode.
   * @param node The node to start from
   * @returns the deepest lastchild
   */
  private getDeepestLastDescendant(node: Node): Node {
    if (isLI(node) || isTextNode(node)) {
      return node;
    }
    let cur = node;
    while (cur.lastChild && !isLI(cur)) {
      cur = cur.lastChild;
    }
    return cur;
  }
  /**
   * Go as deep as possible, looking at the firstChild
   * of the node at every step. Stop when we found a
   * textNode.
   * @param node The node to start from
   * @returns the deepest firstChild
   */
  private getDeepestFirstDescendant(node: Node): Node {
    if (isLI(node) || isTextNode(node)) {
      return node;
    }
    let cur = node;
    while (cur.firstChild && !isLI(cur)) {
      cur = cur.firstChild;
    }
    return cur;
  }
  /**
   * If the element is empty, remove it and traverse up the tree,
   * removing empty parents at every step.
   * @param element The element to start from
   */
  private removeEmptyAncestors(element: Element) {
    if (hasVisibleChildren(element)) {
      return;
    }
    let cur: Element | null = element;
    let lastCur: Element | null = null;
    while (cur && !hasVisibleChildren(cur)) {
      lastCur = cur;
      cur = lastCur.parentElement;
      lastCur.remove();
    }
    if (cur && !hasVisibleChildren(cur)) {
      cur.remove();
    } else {
      if (lastCur) {
        lastCur.remove();
      }
    }
  }

  /**
   * Magicspan-aware nextSibling
   * @param node The node to start looking from
   */
  private getNextSibling(node: Node): Node | null {
    let next = node.nextSibling;
    while (this.isMagicSpan(next)) {
      next = next!.nextSibling;
    }
    return next;
  }
  /**
   * Checks whether a node is a magicspan
   * @param node The node to check
   */
  private isMagicSpan(node?: Node | null) {
    return (
      node &&
      node.nodeType === node.ELEMENT_NODE &&
      (node as Element).id === MagicSpan.ID
    );
  }

  /**
   * Determines wheter the node is considered to be
   * part of the list context.
   * @param node The node to check
   */
  private isAnyListNode(node: Node | null) {
    if (!node) {
      return false;
    }
    if (isList(node) || isLI(node)) {
      return true;
    }
    if (isInList(node)) {
      const selection = getWindowSelection();
      if (selection.containsNode(getParentLI(node)!.lastElementChild!, true)) {
        return true;
      }
    }
    return false;
  }
}
