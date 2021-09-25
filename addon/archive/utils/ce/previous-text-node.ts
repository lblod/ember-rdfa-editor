import {
  tagName,
  isVoidElement,
  insertTextNodeWithSpace,
  isList,
  findLastLi,
  siblingLis
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import flatMap from './flat-map';
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";

/**
 * @method findLastThOrTd
 * @param {Node} table the table node to search in
 * @return {Node | null} last th or td of the given table
 * @private
 */
function findLastThOrTd(table: Node): Node | null {
  const matches = flatMap(
    table,
    (node) => {return tagName(node) === "th" || tagName(node) === "td";},
    false
  );

  if (matches.length > 0) {
    return matches[matches.length - 1];
  }

  return null;
}

/**
 * @method lastTextChild
 * @param {Node} node
 * @returns {Text} last text child
 * @private
 */
function lastTextChild(node: Node): Text {
  if (node.nodeType !== Node.ELEMENT_NODE || isVoidElement(node)) {
    throw new Error("Invalid argument, expected a (non void) element.");
  }

  if (node.lastChild) {
    if (node.lastChild.nodeType === Node.TEXT_NODE) {
      return node.lastChild as Text;
    } else {
      return insertTextNodeWithSpace(node, node.lastChild, true);
    }
  } else {
    // Create text node and append.
    const textNode = document.createTextNode(INVISIBLE_SPACE);
    node.appendChild(textNode);

    return textNode;
  }
}

/**
 * Returns the node we want to place the marker before (or in if it's a text node).
 *
 * NOTE: A large portion of this code is shared with
 * findPreviousVisibleApplicableNode. Could not merge because I'm not
 * sure what the effects will be elsewhere.
 *
 * @method findPreviousApplicableNode
 * @param {Node} node
 * @param {HTMLElement} rootNode
 * @return {Node} previous applicable node
 * @private
 */
function findPreviousApplicableNode(node: Node | null, rootNode: HTMLElement): Node {
  if (!node || node === rootNode) {
    return rootNode;
  }

  if (tagName(node) === "li") {
    const siblings = siblingLis(node as HTMLLIElement);
    const index = siblings.indexOf(node as HTMLLIElement);

    if (index > 0) {
      return lastTextChild(siblings[index - 1]);
    } else {
      return findPreviousApplicableNode(node.parentNode, rootNode);
    }
  }

  if (node.previousSibling) {
    const sibling = node.previousSibling;

    if (isVoidElement(sibling)) {
      if (sibling.previousSibling) {
        return sibling.previousSibling;
      }

      return findPreviousApplicableNode(node.parentNode, rootNode);
    } else if (tagName(sibling) === "table") {
      const validNodeForTable = findLastThOrTd(sibling);

      if (validNodeForTable) {
        return lastTextChild(validNodeForTable);
      } else {
        // Table has no cells, skip the table all together.
        return findPreviousApplicableNode(sibling, rootNode);
      }
    } else if (isList(sibling)) {
      const lastLi = findLastLi(sibling as HTMLUListElement | HTMLOListElement);

      if (lastLi) {
        return lastTextChild(lastLi);
      } else {
        return findPreviousApplicableNode(sibling, rootNode);
      }
    }

    if (node.nodeType === Node.TEXT_NODE && sibling.lastChild) {
      // Descend into sibling if possible.
      return sibling.lastChild;
    }

    if (sibling.nodeType !== Node.TEXT_NODE && sibling.nodeType !== Node.ELEMENT_NODE) {
      return findPreviousApplicableNode(sibling, rootNode);
    }

    return sibling;
  } else if (node.parentNode) {
    return findPreviousApplicableNode(node.parentNode, rootNode);
  }

  throw new Error ("Received a node without a parent node.");
}

/**
 * Find or create the next logical text node for the editor in the dom tree.
 *
 * @method nextTextNode
 *
 * @param {Node} baseNode (warning: please note; non textNodes as input are lightly tested)
 * @param {HTMLElement} rootNode of the dom tree, don't move outside of this root
 * @return {Text | null} nextNode or null if textNode is at the end of the tree
 * @public
 */
export default function previousTextNode(baseNode: Node, rootNode: HTMLElement): Text | null {
  const previousNode = findPreviousApplicableNode(baseNode, rootNode);
  // Next node is rootNode, so I'm at the start of the tree.
  if (previousNode === rootNode) {
    return null;
  }

  if (previousNode.nodeType === Node.ELEMENT_NODE) {
    // Insert a text node in the returned node.
    return insertTextNodeWithSpace(previousNode); // TODO: check if this is correct
  } else {
    return previousNode as Text;
  }
}


