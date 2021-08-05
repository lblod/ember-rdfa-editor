import { A } from '@ember/array';
import { PernetSelection, PernetSelectionBlock } from '@lblod/ember-rdfa-editor/editor/pernet';
import RichNode from "@lblod/marawa/rich-node";

/**
 * Fake class to list helper functions
 * these functions can be included using
 *
 *`import { function } from @lblod/ember-rdfa-editor/utils/dom-helpers;`
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
 * @public
 */
function sliceTextIntoTextNode(textNode: Text, text: string, start: number): void {
  const textContent = textNode.textContent || "";
  const content = [];
  content.push(textContent.slice(0, start));
  content.push(text);
  content.push(textContent.slice(start));
  textNode.textContent = content.join('');
}

/**
 * dom helper to insert a text node with an invisible space into a DOMElement.
 *
 * @method insertTextNodeWithSpace
 * @public
 */
function insertTextNodeWithSpace(parentDomNode: Node, relativeToSibling: ChildNode | null = null, after = false): Text {
  const textNode = document.createTextNode(invisibleSpace);

  if (relativeToSibling) {
    if (after) {
      relativeToSibling.after(textNode);
    } else {
      relativeToSibling.before(textNode);
    }
  } else {
    parentDomNode.appendChild(textNode);
  }

  return textNode;
}

/**
 * dom helper to unwrap an element in the dom tree
 * this replaces the element with its child nodes
 *
 * @method unwrapElement
 * @public
 */
function unwrapElement(node: HTMLElement): void {
  const parent = node.parentElement;
  let baseNode: ChildNode = node;
  if (parent) {
    while (node.childNodes && node.childNodes.length > 0) {
      const nodeToInsert = node.childNodes[node.childNodes.length - 1];
      parent.insertBefore(nodeToInsert, baseNode);
      baseNode = nodeToInsert;
    }
    parent.removeChild(node);
  }
}

/**
 * polyfill for ChildNode.remove. Removes node and children from tree.
 *
 * @method removeNode
 * @deprecate all supported browser have ChildNode.remove
 * @public
 */
function removeNode(node: Node) {
  const parent = node.parentNode;
  if (parent)
    parent.removeChild(node);
}

/**
 * dom helper to check whether a node is a "void element"
 * https://www.w3.org/TR/html/syntax.html#void-elements
 *
 * @method isVoidElement
 * @public
 */
function isVoidElement(node: Node): boolean {
  return node.nodeType === Node.ELEMENT_NODE && /^(AREA|BASE|BR|COL|EMBED|HR|IMG|INPUT|LINK|META|PARAM|SOURCE|TRACK|WBR)$/i.test((node as Element).tagName);
}

/**
 * dom helper to check whether a node is an element
 * @method isElement
 * @public
 * @param node
 */
function isElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

/**
 * Determine whether a node's text content is entirely whitespace.
 * from https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace_in_the_DOM
 *
 * @method isAllWhitespace
 */
function isAllWhitespace(node: Text): boolean {
  // Use ECMA-262 Edition 3 String and RegExp features
  return !(/[^\t\n\r ]/.test(node.textContent || ""));
}

/**
 * Determine whether a node is displayed as a block or is a list item
 * @method isDisplayedAsBlock
 */

function isDisplayedAsBlock(domNode: Node): boolean {
  if (!isElement(domNode))
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
function smartSplitTextNode(textNode: Text, splitAt: number): Array<HTMLElement> {
  const parent = textNode.parentElement;
  if (parent) {
    const textContent = textNode.textContent || "";
    const firstTextNode = document.createTextNode(textContent.slice(0, splitAt));
    const lastTextNode = document.createTextNode(textContent.slice(splitAt));
    const extraParent = parent.cloneNode(false) as HTMLElement;
    parent.replaceChild(firstTextNode, textNode);
    parent.after(extraParent);
    extraParent.appendChild(lastTextNode);
    return [parent, extraParent];
  }
  else {
    return [];
  }
}

/** list helpers **/

/**
 * check if the provided node is phrasing content
 * @method isPhrasingContent
 * @public
 */
function isPhrasingContent(node: HTMLElement): boolean {
  return node.nodeType !== Node.ELEMENT_NODE ||
    ['abbr', 'audio', 'b', 'bdo', 'br', 'button', 'canvas', 'cite', 'code', 'command', 'data', 'datalist', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'kbd', 'keygen', 'label', 'mark', 'math', 'meter', 'noscript', 'object', 'output', 'picture', 'progress', 'q', 'ruby', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'textarea', 'time', 'var', 'video'].includes(tagName(node));
}

/**
 * check if the provided node is a list (e.g ol or ul)
 * @method isList
 * @public
 */
function isList(node?: Node | null): node is HTMLElement {
  if (!node) return false;
  return (
    node.nodeType === node.ELEMENT_NODE &&
    ["ul", "ol"].includes((node as Element).tagName.toLowerCase())
  );
}

/**
 * returns all sibling that are an li
 * @method siblingLis
 * @public
 */
function siblingLis(node: HTMLLIElement): Array<HTMLLIElement> {
  const lis: Array<HTMLLIElement> = [];
  if (node.parentElement) {
    for (const el of node.parentElement.children) {
      if (tagName(el) === 'li')
        lis.push(el as HTMLLIElement);
    }
  }
  return lis;
}


/**
 * returns all LI's from list
 * @method getAllLisFromList
 * @public
 */
function getAllLisFromList(list: HTMLUListElement | HTMLOListElement): Array<HTMLLIElement> {
  const listItems: Array<HTMLLIElement> = [];
  for (const element of [...list.children]) {
    if (tagName(element) === 'li') {
      listItems.push(element as HTMLLIElement);
    }
  }
  return listItems;
}

/**
 * check if the provided node is an empty list (e.g ol or ul without li's)
 * @method isEmptyList
 * @public
 */
function isEmptyList(node: HTMLUListElement | HTMLOListElement): boolean {
  if (!isList(node)) {
    return false;
  }
  //sometimes lists may contain other stuff then li, if so we ignore this because illegal
  for (let x = 0; x < node.children.length; x++) {
    if (tagName(node.children[x]) === 'li') {
      return false;
    }
  }
  return true;
}

/**
 * TODO: is this used anywhere? this seems badly named and was undocumented
 * @method isIgnorableElement
 */
function isIgnorableElement(node: Text): boolean {
  return node.nodeType === Node.TEXT_NODE && node.parentElement !== null && tagName(node.parentElement) === "ul";
}

/**
 * insert node b after node a
 * @method insertNodeBAfterNodeA
 * @deprecate use ChildNode.after
 * @public
 */
function insertNodeBAfterNodeA(_parent: HTMLElement, nodeA: ChildNode, nodeB: ChildNode) {
  nodeA.after(nodeB);
}

/**
 * return lowercased tagname of a provided node or an empty string for non element nodes
 * @method tagName
 * @public
 */
function tagName(node?: Node | null): string {
  if (!node) return '';
  return isElement(node) ? node.tagName.toLowerCase() : '';
}

/**
 * check if the node is a <br> tag or a block
 * TODO: where it this used?
 * @method isBlockOrBr
 * @public
 */
function isBlockOrBr(node: HTMLElement): boolean {
  return tagName(node) == 'br' || isDisplayedAsBlock(node);
}

/**
 * given html string, convert it into DomElements
 * @method createElementsFromHtml
 * @public
 */
function createElementsFromHTML(htmlString: string): Array<ChildNode> {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return Array.from(div.childNodes);
}


/**
 * find previous list item
 * @method findPreviousLi
 * @public
 */
function findPreviousLi(currLI: HTMLLIElement): HTMLLIElement | null {
  let previousElement: Element | null = currLI;
  do {
    previousElement = previousElement.previousElementSibling;
  } while (previousElement && tagName(previousElement) !== 'li');
  return previousElement ? previousElement as HTMLLIElement : null;
}

/**
 * for a given node find the LI containing it, or null if it isn't contained in an LI
 * @method getParentLI
 * @public
 */
function getParentLI(node: Node): HTMLLIElement | null {
  if (!node.parentNode) return null;
  if (isLI(node.parentNode)) return (node.parentNode );
  return getParentLI(node.parentNode);
}

/**
 * determine whether the provided Node is an LI
 * @method isLi
 */
function isLI(node: Node): node is HTMLLIElement {
  return node.nodeType === node.ELEMENT_NODE && tagName(node as Element) === 'li';
}

/**
 * determine whether the provided Node is Text
 * @method isTextNode
 * @public
 */
function isTextNode(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE;
}

/**
 * TODO: where is this used, seems very specific... why not just use tagName(list) ?
 * @method getListTagName
 * @deprecate
 * @public
 */
function getListTagName(listElement: HTMLUListElement | HTMLOListElement): string {
  return tagName(listElement) === 'ul' ? 'ul' : 'ol';
}

/**
 * We need to apply or remove a property to all portions of text based on the output
 * contained in them.  We can split the important nodes in three
 * pieces:
 *
 * - start: text nodes which contain partial content to highlight
 * - middle: rich nodes which are the highest parent of a text node that are still contained in the selected range
 * - end: trailing text nodes which contain partial content to highlight
 *
 * TODO: not a dom helper!
 * Detecting this range is tricky
 *
 * @method findWrappingSuitableNodes
 * @param Selection selection
 * @for PropertyHelpers
 * @return Array array of selections
 */
function findWrappingSuitableNodes(selection: PernetSelection ): Array<PernetSelectionBlock> {
  if (!selection.selectedHighlightRange) {
    // TODO: support context selections as well
    // this might be fairly trivial but focussing on text selection for now
    throw new Error('currently only selectedHighlightRange is supported');
  }
  const nodes = [];
  const domNodes: Array<Node> = [];
  const [start, end] = selection.selectedHighlightRange;
  for (const { richNode, range } of selection.selections) {
    if (richNode.start < start || richNode.end > end) {
      // this node only partially matches the selected range
      // so it needs to be split up later and we can't walk up the tree.
      if (!domNodes.includes(richNode.domNode)) {
        nodes.push({ richNode, range, split: true });
        domNodes.push(richNode.domNode);
      }
    }
    else {
      // walk up the tree as longs as we fit within the range
      let current = richNode;
      const isNotRootNode = function(richNode : RichNode) : boolean { return !!richNode.parent; };
      while (current.parent && isNotRootNode(current.parent) && current.parent.start >= start && current.parent.end <= end) {
        current = current.parent;
      }
      if (!domNodes.includes(current.domNode)) {
        nodes.push({ richNode: current, range: [current.start, current.end], split: false });
        domNodes.push(current.domNode);
      }
    }
  }
  // remove nodes that are contained within other nodes
  const actualNodes: Array<PernetSelectionBlock> = A();
  for (const possibleNode of nodes) {
    const containedInAnotherPossibleNode = nodes.some((otherNode) => otherNode !== possibleNode && otherNode.richNode.domNode.contains(possibleNode.richNode.domNode));
    if (!containedInAnotherPossibleNode) {
      actualNodes.push(possibleNode);
    }
  }
  return actualNodes;
}

/**
 * @method findFirstLi
 * @param {Node} list the list node to search in
 * @return {Node | undefined} first li of the given list
 * @public
 */
function findFirstLi(list: HTMLUListElement | HTMLOListElement): HTMLLIElement | undefined {
  if (!isList(list)) {
    throw new Error("Invalid argument: node is not a list.");
  }

  return Array.from(list.childNodes).find((node) => tagName(node) === "li") as HTMLLIElement;
}

/**
 * @method findLastLi
 * @param {Node} list the list node to search in
 * @return {Node | undefined} last li of the given list
 * @public
 */
function findLastLi(list: HTMLUListElement | HTMLOListElement): HTMLLIElement | undefined {
  if (!isList(list)) {
    throw new Error("Invalid argument: node is not a list.");
  }

  return Array.from(list.children).reverse().find((node) => tagName(node) === "li") as HTMLLIElement;
}

/**
 * From an Element, checks if it is visible or not.
 * Note: there is an edge case with 'visibility: hidden'.
 * See: https://stackoverflow.com/a/33456469/1092608 (the comments)
 * @method isVisibleElement
 * @public
 */
function isVisibleElement(element: HTMLElement): boolean {
  //Stolen from https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js
  //SO likes this answer https://stackoverflow.com/a/33456469/1092608
  //Note: there is still some edge case (see comments): "This will return true for an element with visibility:hidden"
  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

/**
 * Utility to get the selection in a type-safe way. A null selection only happens when called on a
 * hidden iframe in Firefox, so it is ok to throw an error here instead of nullchecking everywhere
 * see https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
 */
function getWindowSelection(): Selection {
  const selection = window.getSelection();
  if (!selection)
    throw new Error(
      "Window selection not found. This is an error and does not mean" +
        "the selection was empty"
    );
  return selection;
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
  unwrapElement,
  removeNode,
  isVoidElement,
  isElement,
  isVisibleElement,
  isIgnorableElement,
  createElementsFromHTML,
  siblingLis,
  getAllLisFromList,
  isAllWhitespace,
  getParentLI,
  isLI,
  isTextNode,
  getListTagName,
  findPreviousLi,
  isPhrasingContent,
  isBlockOrBr,
  findWrappingSuitableNodes,
  findFirstLi,
  findLastLi,
  getWindowSelection
};
