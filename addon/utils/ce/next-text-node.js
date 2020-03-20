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
 * @method findFirstLi
 * @param {DomNode} node the ul node to search in
 * @private
 */
function findFirstLi(ul) {
  if (tagName(ul) !== 'ul')
    throw `invalid argument, expected an ul`;
  if (ul.children && ul.children.length > 0)
    return Array.from(ul.children).find((node) => tagName(node) === 'li');
  return null;
}

/**
 * @method findFirstThOrTd
 * @param {DomNode} table
 * @private
 */
function findFirstThOrTd(table) {
  let matches = flatMap(table, (node) => { return tagName(node) === 'td'}, true);
  if (matches.length == 1) {
    return matches[0];
  }
  return null;
}
/**
 * @method firstTextChild
 * @param {DOMNode} node
 * @private
 */
function firstTextChild(node) {
  if (node.nodeType !== Node.ELEMENT_NODE || isVoidElement(node))
    throw "invalid argument, expected a (non void) element";
  if (node.firstChild) {
    if (node.firstChild.nodeType === Node.TEXT_NODE) {
      return node.firstChild;
    }
    else {
      return insertTextNodeWithSpace(node, node.firstChild);
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
 * returns the node we want to place the marker before (or in if it's a text node)
 * @method findNextApplicableNode
 * @param {DOMNode} node
 * @param {DOMElement} rootNode
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
    }
    else if (isVoidElement(sibling)) {
      return findNextApplicableNode(node.parentNode, rootNode);
    }
    else if (tagName(sibling) == 'table') {
      const validNodeForTable = findFirstThOrTd(sibling);
      if (validNodeForTable) {
        return firstTextChild(validNodeForTable);
      }
      else {
        // table has no cells, skip the table alltogether
        return findNextApplicableNode(sibling);
      }
    }
    else if (isList(sibling)) {
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
    if (sibling.nodeType !== Node.TEXT_NODE && sibling.nodeType !== Node.ELEMENT_NODE)
      return findNextApplicableNode(sibling, rootNode);
    return sibling;
  }
  else if (node.parentNode) {
    return findNextApplicableNode(node.parentNode, rootNode);
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
 */
export default function nextTextNode(textNode, rootNode) {
  const nextNode = findNextApplicableNode(textNode, rootNode);
  if (nextNode === rootNode) {
    // next node is rootNode, so I'm at the end of the tree
    return null;
  }
  if (nextNode.nodeType === Node.ELEMENT_NODE) {
    return insertTextNodeWithSpace(nextNode.parentNode, nextNode);
  }
  else {
    // it's a text node
    return nextNode;
  }
}
