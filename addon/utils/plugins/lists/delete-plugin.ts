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
} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {
  stringToVisibleText,
  hasVisibleChildren,
  moveCaretToEndOfNode,
} from "@lblod/ember-rdfa-editor/editor/utils";
import { RawEditor } from "@lblod/ember-rdfa-editor/editor/raw-editor";

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
    // if (this.isAnyListNode(manipulation.node)) {
    const dispatch = (
      manipulation: RemoveBoundaryBackwards,
      editor: RawEditor
    ) => {
      this.mergeBackwards(manipulation.node, editor);
    };
    return { allow: true, executor: dispatch.bind(this) };
    // }
    // return null;
  }
  private guidanceForRemoveBoundaryForwards(
    manipulation: RemoveBoundaryForwards
  ): ManipulationGuidance | null {
    // if (this.isAnyListNode(manipulation.node)) {
    const dispatch = (
      manipulation: RemoveBoundaryForwards,
      editor: RawEditor
    ) => {
      this.mergeForwards(manipulation.node, editor);
    };
    return { allow: true, executor: dispatch.bind(this) };
    // }
    // return null;
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
        editor: RawEditor
      ) => {
        this.mergeForwards(manipulation.node, editor);
      };
      return { allow: true, executor: dispatcher.bind(this) };
    }
    return null;
  }

  /**
   * Merge the previous node with our node
   */
  private mergeBackwards(node: Node, editor: RawEditor) {
    debugger;
    const selection = getWindowSelection();
    const baseNode = this.findNodeBefore(node, editor.rootNode);
    if (!baseNode) {
      return;
    }
    const mergeNode = this.getDeepestFirstDescendant(baseNode);
    let cursorPosition = 0;
    if (isTextNode(mergeNode) && mergeNode.textContent) {
      cursorPosition = mergeNode.textContent.length;
    }
    const nodeToMerge = this.getDeepestFirstDescendant(node);
    this.mergeNodes(mergeNode, nodeToMerge);

    this.repositionCursor(mergeNode, nodeToMerge, cursorPosition);
    editor.updateRichNode();
  }

  /**
   * Merge the next node with our node
   */
  private mergeForwards(node: Node, editor: RawEditor) {
    debugger;
    const selection = getWindowSelection();

    const mergeNode = this.getDeepestLastDescendant(node);
    let cursorPosition = 0;
    if (isTextNode(mergeNode) && mergeNode.textContent) {
      cursorPosition = mergeNode.textContent.length;
    }
    const targetNode = this.findNodeAfter(node, editor.rootNode);
    if (!targetNode) {
      return;
    }
    const nodeToMerge = this.getDeepestFirstDescendant(targetNode);
    this.mergeNodes(mergeNode, nodeToMerge);

    this.repositionCursor(mergeNode, nodeToMerge, cursorPosition);
    editor.updateRichNode();
  }

  /** Reposition cursor after a merge */
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
    if (isTextNode(nodeToMerge)) {
      const parent = nodeToMerge.parentElement;
      if (isTextNode(mergeNode)) {
        this.concatenateNodes(mergeNode, nodeToMerge);
        removeNode(nodeToMerge);
      } else {
        mergeNode.appendChild(nodeToMerge);
      }
      if (stringToVisibleText(nodeToMerge.textContent || "")) {
        this.hasChanged = true;
      }
      this.removeEmptyAncestors(parent!);
    } else {
      // TODO we need better better utilities to check this
      //these nodes are always visible, even if they are empty
      if (isLI(nodeToMerge) || tagName(nodeToMerge as Element) === "br") {
        this.hasChanged = true;
      }
      this.removeEmptyAncestors(nodeToMerge as Element);
    }
  }
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
  private concatenateNodes(left: Text, right: Text) {
    if (left.textContent) {
      if (right.textContent) {
        left.textContent += right.textContent;
      }
    } else {
      left.textContent = right.textContent;
    }
  }
  private getDeepestLastDescendant(node: Node): Node {
    if (isTextNode(node)) {
      return node;
      // assuming we are only dealing with textnodes and element nodes
    } else {
      const lastChild = node.lastChild;
      if (lastChild) {
        return this.getDeepestFirstDescendant(lastChild);
      } else {
        return node;
      }
    }
  }
  private getDeepestFirstDescendant(node: Node): Node {
    if (isTextNode(node)) {
      return node;
      // assuming we are only dealing with textnodes and element nodes
    } else {
      const firstChild = node.firstChild;
      if (firstChild) {
        return this.getDeepestFirstDescendant(firstChild);
      } else {
        return node;
      }
    }
  }
  private removeEmptyAncestors(element: Element) {
    debugger;

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
   */
  private getNextSibling(node: Node): Node | null {
    let next = node.nextSibling;
    while (this.isMagicSpan(next)) {
      next = next!.nextSibling;
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
  private isAnyListNode(node: Node | null) {
    if (!node) {
      return false;
    }
    return isList(node) || isLI(node);
  }
}
