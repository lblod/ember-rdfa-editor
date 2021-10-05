import {
  tagName,
  isVoidElement,
  insertTextNodeWithSpace,
  isList,
  findFirstLi,
  siblingLis
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import flatMap from './flat-map';
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";

/**
 * @method findFirstThOrTd
 * @param {Node} table the table node to search in
 * @return {Node} first th or td of the given table
 * @private
 */
function findFirstThOrTd(table: Node): Node | null {
  const matches = flatMap(
    table,
    (node) => {return tagName(node) === "th" || tagName(node) === "td";},
    true
  );

  if (matches.length === 1) {
    return matches[0];
  }

  return null;
}

/**
 * @method firstTextChild
 * @param {Node} node
 * @returns {Text} first text child
 * @private
 */
function firstTextChild(node: Node): Text {
  if (node.nodeType !== Node.ELEMENT_NODE || isVoidElement(node)) {
    throw new Error("Invalid argument, expected a (non void) element.");
  }

  if (node.firstChild) {
    if (node.firstChild.nodeType === Node.TEXT_NODE) {
      return node.firstChild as Text;
    } else {
      return insertTextNodeWithSpace(node, node.firstChild, false);
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
 * @method findNextApplicableNode
 * @param {Node} node
 * @param {HTMLElement} rootNode
 * @return {Node} next applicable node
 * @private
 */
function findNextApplicableNode(node: Node | null, rootNode: HTMLElement): Node {
  if (!node || node === rootNode) {
    return rootNode;
  }

  if (tagName(node) === "li") {
    const siblings = siblingLis(node as HTMLLIElement);
    const index = siblings.indexOf(node as HTMLLIElement);

    if (index < siblings.length - 1) {
      return firstTextChild(siblings[index + 1]);
    } else {
      return findNextApplicableNode(node.parentNode, rootNode);
    }
  }

  if (node.nextSibling) {
    const sibling = node.nextSibling;

    if (isVoidElement(sibling)) {
      if (sibling.nextSibling) {
        return sibling.nextSibling;
      }

      return findNextApplicableNode(node.parentNode, rootNode);
    } else if (tagName(sibling) === "table") {
      const validNodeForTable = findFirstThOrTd(sibling);

      if (validNodeForTable) {
        return firstTextChild(validNodeForTable);
      } else {
        // Table has no cells, skip the table all together.
        return findNextApplicableNode(sibling, rootNode);
      }
    } else if (isList(sibling)) {
      const firstLi = findFirstLi(sibling as HTMLUListElement | HTMLOListElement);

      if (firstLi) {
        return firstTextChild(firstLi);
      } else {
        return findNextApplicableNode(sibling, rootNode);
      }
    }

    if (node.nodeType === Node.TEXT_NODE && sibling.firstChild) {
      // Descend into sibling if possible.
      return sibling.firstChild;
    }

    if (sibling.nodeType !== Node.TEXT_NODE && sibling.nodeType !== Node.ELEMENT_NODE) {
      return findNextApplicableNode(sibling, rootNode);
    }

    return sibling;
  } else if (node.parentNode) {
    return findNextApplicableNode(node.parentNode, rootNode);
  }

  throw new Error("Received a node without a parent node.");
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
export default function nextTextNode(baseNode: Node, rootNode: HTMLElement): Text | null {
  const nextNode = findNextApplicableNode(baseNode, rootNode);
  // Next node is rootElement, so I'm at the end of the tree.
  if (nextNode === rootNode) {
    return null;
  }

  if (nextNode.nodeType === Node.ELEMENT_NODE) {
    // Insert a text node in the returned node.
    return insertTextNodeWithSpace(nextNode); // TODO: check if this is correct
  } else {
    // It's a text node.
    return nextNode as Text;
  }
}
