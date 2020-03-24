import {
  tagName,
  isVoidElement,
  insertTextNodeWithSpace,
  invisibleSpace,
  isList,
  siblingLis
} from './dom-helpers';
import flatMap from './flat-map';
/**
 * @method findLastLi
 * @param {DomNode} node the ul node to search in
 * @private
 */
function findLastLi(ul) {
  if (tagName(ul) !== 'ul')
    throw `invalid argument, expected an ul`;
  if (ul.children && ul.children.length > 0)
    return Array.from(ul.children).reverse().find((node) => tagName(node) === 'li');
  return null;
}

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
  let matches = flatMap(table, (node) => { return tagName(node) === 'td'});
  if (matches.length > 0) {
    return matches[matches.length - 1];
  }
  return null;
}

/**
 * returns the node we want to place the marker before (or in if it's a text node)
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
