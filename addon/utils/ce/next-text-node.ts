import {
  tagName,
  isVoidElement,
  insertTextNodeWithSpace,
  invisibleSpace,
  isList,
  siblingLis
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import flatMap from './flat-map';

/**
 * @method findFirstLi
 * @param {Node} ulNode the ul node to search in
 * @private
 */
function findFirstLi(ulNode) {
  if (tagName(ulNode) !== "ul") {
    throw new Error("Invalid argument, expected a ul.");
  }

  if (ulNode.childNodes && ulNode.childNodes.length > 0) {
    return Array.from(ulNode.childNodes).find((node) => tagName(node) === "li");
  }

  return null;
}

/**
 * @method findFirstThOrTd
 * @param {Node} table
 * @private
 */
function findFirstThOrTd(table) {
  let matches = flatMap(
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
function firstTextChild(node) {
  if (node.nodeType !== Node.ELEMENT_NODE || isVoidElement(node)) {
    throw new Error("Invalid argument, expected a (non void) element.");
  }

  if (node.firstChild) {
    if (node.firstChild.nodeType === Node.TEXT_NODE) {
      return node.firstChild;
    } else {
      return insertTextNodeWithSpace(node, node.firstChild);
    }
  } else {
    // Create text node and append.
    const textNode = document.createTextNode(invisibleSpace);
    node.appendChild(textNode);

    return textNode;
  }
}

/**
 * Returns the node we want to place the marker before (or in if it's a text node).
 * @method findNextApplicableNode
 * @param {Node} node
 * @param {HTMLElement} rootNode
 * @return {Node}
 * @private
 */
function findNextApplicableNode(node, rootNode) {
  if (node === rootNode) {
    return rootNode;
  }

  if (tagName(node) === 'li') {
    const siblings = siblingLis(node);
    const index = siblings.indexOf(node);
    if (index < siblings.length - 1)
      return firstTextChild(siblings[index+1]);
    else
      return findNextApplicableNode(node.parentNode);
  }

  if (node.nextSibling) {
    const sibling = node.nextSibling;
    if (isVoidElement(sibling) && sibling.nextSibling) {
      return sibling.nextSibling;
    } else if (isVoidElement(sibling)) {
      return findNextApplicableNode(node.parentNode, rootNode);
    } else if (tagName(sibling) === "table") {
      const validNodeForTable = findFirstThOrTd(sibling);
      if (validNodeForTable) {
        return firstTextChild(validNodeForTable);
      } else {
        // table has no cells, skip the table alltogether
        return findNextApplicableNode(sibling);
      }
    } else if (isList(sibling)) {
      const firstLi = findFirstLi(sibling);
      if (firstLi) {
        return firstTextChild(firstLi);
      }
      else {
        return findNextApplicableNode(sibling, rootNode);
      }
    }

    const startingAtTextNode = node.nodeType === Node.TEXT_NODE;
    if (startingAtTextNode && sibling.firstChild) {
      // descend into sibling if possible
      return sibling.firstChild;
    }

    if (sibling.modelNodeType !== Node.TEXT_NODE && sibling.modelNodeType !== Node.ELEMENT_NODE) {
      return findNextApplicableNode(sibling, rootNode);
    }

    return sibling;
  } else if (node.parentNode) {
    return findNextApplicableNode(node.parentNode, rootNode);
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
 */
export default function nextTextNode(baseNode, rootNode) {
  const nextNode = findNextApplicableNode(baseNode, rootNode);
  if (nextNode === rootNode) {
    // Next node is rootNode, so I'm at the end of the tree.
    return null;
  }

  if (nextNode.nodeType === Node.ELEMENT_NODE) {
    return insertTextNodeWithSpace(nextNode.parentNode, nextNode);
  } else {
    // It's a text node.
    return nextNode;
  }
}
