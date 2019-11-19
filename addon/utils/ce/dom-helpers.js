import { A } from '@ember/array';
/**
 * Fake class to list helper functions
 * these functions can be included using
 *
 *`import { function } from @lblod/ember-contenteditable/utils/dom-helpers;` 
 * @module contenteditable-editor
 * @class DomHelpers
 * @constructor
 */

/**
 * @property invisibleSpace
 * @type string
 * @static
 * @final
 */
const invisibleSpace = '\u200B';

/**
 * dom helper to insert extra text into a text node at the provided position
 *
 * @method sliceTextIntoTextNode
 * @param {TextNode} textNode
 * @param {String} text
 * @param {number} start
 * @public
 */
function sliceTextIntoTextNode(textNode, text, start) {
  let textContent = textNode.textContent;
  let content = [];
  content.push(textContent.slice(0, start));
  content.push(text);
  content.push(textContent.slice(start));
  textNode.textContent = content.join('');
};

/**
 * dom helper to insert a text node with an invisible space into a DOMElement.
 *
 * @method insertTextNodeWithSpace
 * @param {DOMElement} parentDomNode
 * @param {DOMNode} relativeToSibling
 * @param {boolean} after
 * @public
 */
function insertTextNodeWithSpace(parentDomNode, relativeToSibling = null, after = false) {
  let textNode = document.createTextNode(invisibleSpace);
  if (relativeToSibling) {
    if (after) {
      insertNodeBAfterNodeA(parentDomNode, relativeToSibling, textNode);
    }
    else {
      parentDomNode.insertBefore(textNode, relativeToSibling);
    }
  }
  else {
    parentDomNode.appendChild(textNode);
  }
  return textNode;
};
/**
 * dom helper to remove a node from the dom tree
 * this inserts replaces the node with its child nodes
 *
 * @method removeNodeFromTree
 * @param {DOMNode} node
 * @public
 */
function removeNodeFromTree(node) {
  let parent = node.parentNode;
  let baseNode = node;
  while (node.childNodes && node.childNodes.length > 0) {
    let nodeToInsert = node.childNodes[node.childNodes.length - 1];
    parent.insertBefore(nodeToInsert, baseNode);
    baseNode = nodeToInsert;
  }
  parent.removeChild(node);
};

/**
 * polyfill for ChildNode.remove. Removes node and children from tree.
 *
 * @method removeNodeFrom
 * @param {DOMNode} node
 * @public
 */
function removeNode(node){
  let parent = node.parentNode;
  if(parent)
    parent.removeChild(node);
};

/**
 * dom helper to check whether a node is a "void element"
 * https://www.w3.org/TR/html/syntax.html#void-elements
 *
 * @method isVoidElement
 * @param {DOMNode} node
 * @return {boolean}
 * @public
 */
function isVoidElement(node) {
  return node.nodeType === Node.ELEMENT_NODE && /^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR|I)$/i.test(node.tagName);
};

/**
 * Determine whether a node's text content is entirely whitespace.
 * from https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace_in_the_DOM
 * @method isAllWhitespace
 * @param {DOMNode}  A node implementing the |CharacterData| interface (i.e.,
 *             a |Text|, |Comment|, or |CDATASection| node
 * @return {boolean}    True if all of the text content of |nod| is whitespace,
 *             otherwise false.
 */
function isAllWhitespace( nod ) {
  // Use ECMA-262 Edition 3 String and RegExp features
  return !(/[^\t\n\r ]/.test(nod.textContent));
}


/**
 * Determine whether a node is displayed as a block or is a list item
 * @method isDisplayedAsBlock
 * @param {DOMNode}  node to check
 * @return {boolean}
 */

function isDisplayedAsBlock(domNode) {
  if (domNode.nodeType !== Node.ELEMENT_NODE)
    return false;
  const displayStyle = window.getComputedStyle(domNode)['display'];
  return displayStyle == 'block' || displayStyle == 'list-item';
}

/**
 * agressive splitting specifically for content in an li
 * @method smartSplitTextNode
 * @param {DOMNode} textNode
 * @param {number} splitAt index to split at
 * @return Array the new dom elements that were inserted [parent, siblingParent]
 * @public
 */
const smartSplitTextNode = function(textNode, splitAt) {
  let parent = textNode.parentNode;
  let grandParent = parent.parentNode;
  let firstTextNode = document.createTextNode(textNode.textContent.slice(0, splitAt));
  let lastTextNode = document.createTextNode(textNode.textContent.slice(splitAt));
  let extraParent = parent.cloneNode(false);
  parent.replaceChild(firstTextNode, textNode);
  insertNodeBAfterNodeA(grandParent, parent, extraParent);
  extraParent.appendChild(lastTextNode);
  return [parent, extraParent];
};

/** list helpers **/

/**
 * check if the provided node is a list (e.g ol or ul)
 * @method isList
 * @param {DOMNode} node
 * @return {boolean}
 * @public
 */
function isList(node) {
  return node.nodeType === node.ELEMENT_NODE && ['ul','ol'].includes(node.tagName.toLowerCase());
}

/**
 * returns all sibling that are an li
 * @method siblingLis
 * @param {DOMNode} node
 * @return {Array}
 * @public
 */
function siblingLis(node) {
  const lis = A();
  if (node.parentNode) {
    node.parentNode.childNodes.forEach( (el) => {
      if (tagName(el) === 'li')
        lis.pushObject(el);
    });
  }
  return lis;
}

/**
 * check if the provided node is an empty list (e.g ol or ul without li's)
 * @method isEmptyList
 * @param {DOMNode} node
 * @return {boolean}
 * @public
 */
function isEmptyList(node) {
  if( ! isList(node) ) {
    return false;
  }
  //sometimes lists may contain other stuff then li, if so we ignore this because illegal
  for(var x = 0; x < node.children.length; x++) {
      if (tagName(node.children[x]) === 'li') {
        return false;
      }
  }
  return true;
}

const isIgnorableElement = function isIgnorableElement(node) {
  return node.nodeType === Node.TEXT_NODE && node.parentNode && tagName(node.parentNode) === "ul";
};

/**
 * check if the provided node is a list (e.g ol or ul)
 * @method insertNodeBAfterNodeA
 * @param {DOMNode} parent
 * @param {DOMNode} nodeA
 * @param {DomNode} nodeB
 * @return {boolean}
 * @public
 */
const insertNodeBAfterNodeA = function(parent, nodeA, nodeB) {
  parent.replaceChild(nodeB, nodeA);
  parent.insertBefore(nodeA, nodeB);
};

/**
 * return lowercased tagname of a provided node or an empty string for non element nodes
 * @method tagName
 * @param {DOMNode} node
 * @return {boolean}
 * @public
 */
const tagName = function(node) {
  if(!node) return '';
  return node.nodeType === node.ELEMENT_NODE ? node.tagName.toLowerCase() : '';
};

/**
 * given html string, convert it into DomElements
 * @function createElementsFromHtml
 * @param {String} string containing html
 * @public
 */
const createElementsFromHTML = function(htmlString){
  let div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return Array.from(div.childNodes);
};


/**
 * find previous list item
 */
function findPreviousLi(currLI) {
  var previousElement;
  do {
    previousElement = currLI.previousSibling;
  } while(previousElement && tagName(previousElement) !== 'li')
  return previousElement;
}

function getParentLI(node) {
  if(!node.parentNode) return null;
  if(isLI(node.parentNode)) return node.parentNode;
  return getParentLI(node.parentNode);
};

function isLI( node ) {
  return node.nodeType === node.ELEMENT_NODE && tagName(node) === 'li';
};

function isTextNode( node ) {
  return node.nodeType === Node.TEXT_NODE;
}

function getListTagName( listElement ) {
  return tagName(listElement) === 'ul' ? 'ul' : 'ol';
}

export {
  tagName,
  isDisplayedAsBlock,
  smartSplitTextNode,
  invisibleSpace,
  insertTextNodeWithSpace,
  isList,
  isEmptyList,
  insertNodeBAfterNodeA,
  sliceTextIntoTextNode,
  removeNodeFromTree,
  removeNode,
  isVoidElement,
  isIgnorableElement,
  createElementsFromHTML,
  siblingLis,
  isAllWhitespace,
  getParentLI,
  isLI,
  isTextNode,
  getListTagName,
  findPreviousLi
};
