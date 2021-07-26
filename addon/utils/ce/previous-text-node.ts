import {
  tagName,
  isVoidElement,
  insertTextNodeWithSpace,
  invisibleSpace,
  isList,
  findLastLi,
  siblingLis
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';

import flatMap from './flat-map';

/**
 * @method lastTextChild
 * @param {Node} node
 * @returns {Text} last text child
 * @private
 */
function lastTextChild(node) {
  if (node.nodeType !== Node.ELEMENT_NODE || isVoidElement(node)) {
    throw new Error("Invalid argument, expected a (non void) element.");
  }

  if (node.lastChild) {
    if (node.lastChild.nodeType === Node.TEXT_NODE) {
      return node.lastChild;
    } else {
      return insertTextNodeWithSpace(node, node.lastChild, true);
    }
  } else {
    // Create text node and append.
    const textNode = document.createTextNode(invisibleSpace);
    node.appendChild(textNode);

    return textNode;
  }
}

/**
 * @method findLastThOrTd
 * @param {Node} table
 * @private
 */
function findLastThOrTd(table) {
  let matches = flatMap(
    table,
    (node) => {return tagName(node) === "th" || tagName(node) === "td";}
  );

  if (matches.length > 0) {
    return matches[matches.length - 1];
  }

  return null;
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
 * @private
 */
function findPreviousApplicableNode(node, rootNode) {
  if (node === rootNode) {
    return rootNode;
  }

  if (tagName(node) === "li") {
    const siblings = siblingLis(node);
    const index = siblings.indexOf(node);
    if (index > 0) {
      return lastTextChild(siblings[index-1]);
    } else {
      return findPreviousApplicableNode(node.parentNode);
    }
  }

  if (node.previousSibling) {
    const sibling = node.previousSibling;
    if (isVoidElement(sibling) && sibling.previousSibling) {
      return sibling.previousSibling;
    } else if (isVoidElement(sibling)) {
      return findPreviousApplicableNode(node.parentNode, rootNode);
    } else if (tagName(sibling) === "table") {
      const validNodeForTable = findLastThOrTd(sibling);
      if (validNodeForTable) {
        return lastTextChild(validNodeForTable);
      } else {
        // Table has no cells, skip the table all together.
        return findPreviousApplicableNode(sibling);
      }
    } else if (isList(sibling)) {
      const lastLi = findLastLi(sibling);
      if (lastLi) {
        return lastTextChild(lastLi);
      }
      else {
        return findPreviousApplicableNode(sibling, rootNode);
      }
    }

    const startingAtTextNode = node.nodeType === Node.TEXT_NODE;
    if (startingAtTextNode && sibling.lastChild) {
      // Descend into sibling if possible.
      return sibling.lastChild;
    }

    if (sibling.modelNodeType !== Node.TEXT_NODE && sibling.modelNodeType !== Node.ELEMENT_NODE) {
      return findPreviousApplicableNode(sibling, rootNode);
    }

    return sibling;
  } else if (node.parentNode) {
    return findPreviousApplicableNode(node.parentNode, rootNode);
  }

  throw new Error ("Received a node without a parent node.");
}

/**
 * find or create the next logical text node for the editor in the dom tree
 *
 * @method nextTextNode
 *
 * @param {Node} baseNode (warning: please note; non textNodes as input are lightly tested)
 * @param {HTMLElement} rootNode of the dom tree, don't move outside of this root
 * @return {Text | null} nextNode or null if textNode is at the end of the tree
 * @public
 */
export default function previousTextNode(baseNode, rootNode) {
  const nextNode = findPreviousApplicableNode(baseNode, rootNode);
  if (nextNode === rootNode) {
    // Next node is rootNode, so I'm at the start of the tree.
    return null;
  }

  if (nextNode.modelNodeType === Node.ELEMENT_NODE) {
    // Insert a text node in the returned node.
    return insertTextNodeWithSpace(nextNode);
  } else {
    // It's a text node.
    if (nextNode === null) {
      throw new Error("Previous text node failed.");
    }

    return nextNode;
  }
}
