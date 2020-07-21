import {
  tagName,
  isVoidElement,
  insertTextNodeWithSpace,
  invisibleSpace,
  isList,
  findLastLi,
  siblingLis
} from './dom-helpers';

import flatMap from './flat-map';

/**
 * @method firstTextChild
 * @param {DOMNode} node
 * @private
 */
function lastTextChild(node) {
  if (node.nodeType !== Node.ELEMENT_NODE || isVoidElement(node))
    throw "invalid argument, expected a (non void) element";
  if (node.lastChild) {
    if (node.lastChild.nodeType === Node.TEXT_NODE) {
      return node.lastChild;
    }
    else {
      return insertTextNodeWithSpace(node, node.lastChild, true);
    }
  }
  else {
    // create text node and append
    let textNode = document.createTextNode(invisibleSpace);
    node.appendChild(textNode);
    return textNode;
  }
}

/**
 * @method findLastThOrTd
 * @param {DomNode} table
 * @private
 */
function findLastThOrTd(table) {
  let matches = flatMap(table, (node) => { return tagName(node) === 'td';});
  if (matches.length > 0) {
    return matches[matches.length - 1];
  }
  return null;
}

/**
 * returns the node we want to place the marker before (or in if it's a text node)
 *
 * NOTE: A large portion of this code is shared with
 * findPreviousVisibleApplicableNode.  Could not merge because I'm not
 * sure what the effects will be elsewhere.
 *
 * @method findPreviousApplicableNode
 * @param {DOMNode} node
 * @param {DOMElement} rootNode
 * @private
 */
function findPreviousApplicableNode(node, rootNode) {
  if (node === rootNode) {
    return rootNode;
  }

  if (tagName(node) === 'li') {
    const siblings = siblingLis(node);
    const index = siblings.indexOf(node);
    if (index > 0)
      return lastTextChild(siblings[index-1]);
    else
      return findPreviousApplicableNode(node.parentNode);
  }

  if (node.previousSibling) {
    const sibling = node.previousSibling;
    if (isVoidElement(sibling) && sibling.previousSibling) {
      return sibling.previousSibling;
    }
    else if (isVoidElement(sibling)) {
      return findPreviousApplicableNode(node.parentNode, rootNode);
    }
    else if (tagName(sibling) == 'table') {
      const validNodeForTable = findLastThOrTd(sibling);
      if (validNodeForTable) {
        return lastTextChild(validNodeForTable);
      }
      else {
        // table has no cells, skip the table alltogether
        return findPreviousApplicableNode(sibling);
      }
    }
    else if (isList(sibling)) {
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
      // descend into sibling if possible
      return sibling.lastChild;
    }
    if (sibling.nodeType !== Node.TEXT_NODE && sibling.nodeType !== Node.ELEMENT_NODE)
      return findPreviousApplicableNode(sibling, rootNode);
    return sibling;
  }
  else if (node.parentNode) {
    return findPreviousApplicableNode(node.parentNode, rootNode);
  }
  else
    throw `received a node without a parentNode`;
}

/**
 * Finds a node which is visible or which can be used to remove text from.
 *
 * This is a crude adaptation from findPreviousApplicableNode.
 * Abstractions should be built to cope with both.
 *
 * Returns the node we want to place the marker before (or in if it's
 * a text node)
 *
 * NOTE: A large portion of this code is shared with
 * findPreviousApplicableNode.  Could not merge because I'm not sure
 * what the effects will be elsewhere.
 *
 * @method findPreviousApplicableNode
 * @param {DOMNode} node
 * @param {DOMElement} rootNode
 * @private
 */
function findPreviousVisibleApplicableNode(node, rootNode) {
  if (node === rootNode) {
    return rootNode;
  }

  if (tagName(node) === 'li') {
    const siblings = siblingLis(node);
    const index = siblings.indexOf(node);
    if (index > 0)
      return lastTextChild(siblings[index-1]);
    else
      return findPreviousApplicableNode(node.parentNode);
  }

  if (node.previousSibling) {
    const sibling = node.previousSibling;

    const siblingConsumesSpace = sibling.getClientRects && sibling.getClientRects().length;

    // special table case
    if (tagName(sibling) == 'table') {
      const validNodeForTable = findLastThOrTd(sibling);
      if (validNodeForTable) {
        return lastTextChild(validNodeForTable);
      }
      else {
        // table has no cells, skip the table alltogether
        return findPreviousApplicableNode(sibling);
      }
    }
    // special list case
    else if (isList(sibling)) {
      const lastLi = findLastLi(sibling);
      if (lastLi) {
        return lastTextChild(lastLi);
      }
      else {
        return findPreviousApplicableNode(sibling, rootNode);
      }
    }
    // void case
    else if ( isVoidElement(sibling) ){
      if (siblingConsumesSpace) {
        return sibling;
      } else if (sibling.previousSibling) {
        return sibling.previousSibling;
      } else {
    }
      return findPreviousApplicableNode(node.parentNode, rootNode);
    }

    const startingAtTextNode = node.nodeType === Node.TEXT_NODE;
    if (startingAtTextNode && sibling.lastChild) {
      // descend into sibling if possible
      return sibling.lastChild;
    }
    if (sibling.nodeType !== Node.TEXT_NODE && sibling.nodeType !== Node.ELEMENT_NODE)
      return findPreviousApplicableNode(sibling, rootNode);
    return sibling;
  }
  else if (node.parentNode) {
    return findPreviousApplicableNode(node.parentNode, rootNode);
  }
  else
    throw `received a node without a parentNode`;
}


/**
 * find or create the next logical text node for the editor in the dom tree
 *
 * @method nextTextNode
 *
 * @param {Node} node (warning: please note; non textNodes as input are lightly tested)
 * @param {DOMElement} root of the dom tree, don't move outside of this root
 * @return {TextNode} nextNode or null if textNode is at the end of the tree
 * @public
 */
export default function previousTextNode(baseNode, rootNode) {
  const nextNode = findPreviousApplicableNode(baseNode, rootNode);
  if (nextNode === rootNode) {
    // next node is rootNode, so I'm at the start of the tree
    return null;
  }
  if (nextNode.nodeType === Node.ELEMENT_NODE) {
    // insert a textnode in the returned node
    return insertTextNodeWithSpace(nextNode);
  }
  else {
    // it's a text node
    if (nextNode === null)
      throw "previous text node failed";
    return nextNode;
  }
}

/**
 * Finds or creates the next visible node or text node for the editor
 * in the DOM tree.
 *
 * This method aims to give you a jumpable place, based on the visual
 * representation of the elements or their text content.
 *
 * This is an adaptation from previousTextNode, because I lack
 * insights into what can go wrong, this method has been written
 * analogous to the previousTextNode function in the hopes that
 * tackles sufficient cases.
 *
 * @return {Object} Instance containing node indicating the previous
 * node, jumpedVisibleNode indicating whether we jumped a visible
 * node, insertedTextNode indicating we tried to jump to a text node
 * or inserted one, noPreviousNode indicating no previous node could
 * be found inside the current parent, foundTextNode indicating we
 * found a text node that could be used.
 */
export function previousVisibleNode(baseNode, rootNode) {
  const nextNode = findPreviousVisibleApplicableNode(baseNode, rootNode);
  if (nextNode === rootNode) {
    // next node is rootNode, so I'm at the start of the tree
    return { noPreviousNode: true, node: null };
  }
  else if (nextNode.nodeType === Node.ELEMENT_NODE) {
    if( isVoidElement( nextNode ) ) {
      // insert a space before the empty node and yield that
      const textNode = insertTextNodeWithSpace(baseNode.parentNode, nextNode, false);
      return { jumpedVisibleNode: true, node: textNode };
    } else {
      // insert a textnode in the returned node
      return { insertedTextNode: true, node: insertTextNodeWithSpace(nextNode) };
    }
  }
  else if (nextNode === null ) {
    return { noPreviousNode: true, node: null };
  }
  else {
    // it's a text node
    return { foundTextNode: true, node: nextNode };
  }
}
