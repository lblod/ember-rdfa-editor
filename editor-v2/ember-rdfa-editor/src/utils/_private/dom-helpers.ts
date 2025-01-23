import { INVISIBLE_SPACE } from '#root/utils/_private/constants';

/**
 * Fake class to list helper functions.
 * These functions can be included using:
 * `import { function } from @lblod/ember-rdfa-editor/utils/dom-helpers;`
 *
 * @module contenteditable-editor
 * @class DomHelpers
 * @constructor
 */

/**
 * Dom helper to insert extra text into a text node at the provided position.
 *
 * @method sliceTextIntoTextNode
 * @public
 */
export function sliceTextIntoTextNode(
  textNode: Text,
  text: string,
  start: number,
): void {
  const textContent = textNode.textContent || '';
  const content = [];

  content.push(textContent.slice(0, start));
  content.push(text);
  content.push(textContent.slice(start));

  textNode.textContent = content.join('');
}

/**
 * Dom helper to insert a text node with an invisible space into a DOMElement.
 *
 * @method insertTextNodeWithSpace
 * @public
 */
export function insertTextNodeWithSpace(
  parentDomNode: Node,
  relativeToSibling: ChildNode | null = null,
  after = false,
): Text {
  const textNode = document.createTextNode(INVISIBLE_SPACE);

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
 * Dom helper to unwrap an element in the dom tree.
 * This replaces the element with its child nodes.
 *
 * @method unwrapElement
 * @public
 */
export function unwrapElement(node: HTMLElement): void {
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
 * Polyfill for ChildNode.remove. Removes node and children from tree.
 *
 * @method removeNode
 * @deprecated All supported browsers have ChildNode.remove.
 * @public
 */
export function removeNode(node: Node) {
  const parent = node.parentNode;
  if (parent) {
    parent.removeChild(node);
  }
}

/**
 * Dom helper to check whether a node is an element.
 *
 * @method isElement
 * @public
 */
export function isElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

/**
 * Dom helper to check whether a node is a text node.
 *
 * @method isTextNode
 * @public
 */
export function isTextNode(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE;
}

export function isLeaf(node: Node): boolean {
  return node.childNodes.length === 0;
}

/**
 * Determine whether the provided node is an li.
 *
 * @method isLI
 * @public
 */
export function isLI(node: Node): node is HTMLLIElement {
  return isElement(node) && tagName(node) === 'li';
}

/**
 * Dom helper to check whether a node is a "void element".
 * See: https://www.w3.org/TR/html/syntax.html#void-elements
 *
 * @method isVoidElement
 * @public
 */
export function isVoidElement(node: Node): boolean {
  return (
    isElement(node) &&
    /^(AREA|BASE|BR|COL|EMBED|HR|IMG|INPUT|LINK|META|PARAM|SOURCE|TRACK|WBR)$/i.test(
      node.tagName,
    )
  );
}

/**
 * Determine whether a node's text content is entirely whitespace.
 * From: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace_in_the_DOM
 *
 * @method isAllWhitespace
 * @public
 */
export function isAllWhitespace(node: Text): boolean {
  // Use ECMA-262 Edition 3 String and RegExp features.
  return !/[^\t\n\r ]/.test(node.textContent || '');
}

/**
 * Determine whether a node is displayed as a block or is a list item.
 *
 * @method isDisplayedAsBlock
 * @public
 */
export function isDisplayedAsBlock(domNode: Node): boolean {
  if (!isElement(domNode)) {
    return false;
  }

  const displayStyle = window.getComputedStyle(domNode)['display'];
  return displayStyle === 'block' || displayStyle === 'list-item';
}

export function isContentEditable(node: Node) {
  if (isElement(node)) {
    return node.isContentEditable;
  } else {
    return node.parentElement?.isContentEditable;
  }
}

/**
 * Aggressive splitting specifically for content in an li.
 *
 * @method smartSplitTextNode
 * @param {Text} textNode
 * @param {number} splitAt Index to split at.
 * @return {HTMLElement[]} The new dom elements that were inserted [parent, siblingParent].
 * @public
 */
export function smartSplitTextNode(
  textNode: Text,
  splitAt: number,
): HTMLElement[] {
  const parent = textNode.parentElement;
  if (parent) {
    const textContent = textNode.textContent || '';
    const firstTextNode = document.createTextNode(
      textContent.slice(0, splitAt),
    );
    const lastTextNode = document.createTextNode(textContent.slice(splitAt));
    const extraParent = parent.cloneNode(false) as HTMLElement;

    parent.replaceChild(firstTextNode, textNode);
    parent.after(extraParent);
    extraParent.appendChild(lastTextNode);
    return [parent, extraParent];
  } else {
    return [];
  }
}

/**
 * Check if the provided node is phrasing content.
 *
 * @method isPhrasingContent
 * @public
 */
export function isPhrasingContent(node: HTMLElement): boolean {
  return (
    !isElement(node) ||
    [
      'abbr',
      'audio',
      'b',
      'bdo',
      'br',
      'button',
      'canvas',
      'cite',
      'code',
      'command',
      'data',
      'datalist',
      'dfn',
      'em',
      'embed',
      'i',
      'iframe',
      'img',
      'input',
      'kbd',
      'keygen',
      'label',
      'mark',
      'math',
      'meter',
      'noscript',
      'object',
      'output',
      'picture',
      'progress',
      'q',
      'ruby',
      'samp',
      'script',
      'select',
      'small',
      'span',
      'strong',
      'sub',
      'sup',
      'svg',
      'textarea',
      'time',
      'var',
      'video',
    ].includes(tagName(node))
  );
}

/**
 * Check if the provided node is a list (ul or ol).
 *
 * @method isList
 * @public
 */
export function isList(node?: Node | null): node is HTMLElement {
  if (!node) {
    return false;
  }

  return isElement(node) && ['ul', 'ol'].includes(node.tagName.toLowerCase());
}

/**
 * Return all siblings that are an li.
 *
 * @method siblingLis
 * @public
 */
export function siblingLis(node: HTMLLIElement): HTMLLIElement[] {
  const lis: HTMLLIElement[] = [];
  if (node.parentElement) {
    for (const element of node.parentElement.children) {
      if (isLI(element)) {
        lis.push(element);
      }
    }
  }

  return lis;
}

/**
 * Returns all lis from a list.
 *
 * @method getAllLisFromList
 * @public
 */
export function getAllLisFromList(
  list: HTMLUListElement | HTMLOListElement,
): HTMLLIElement[] {
  const listItems: HTMLLIElement[] = [];
  for (const element of [...list.children]) {
    if (isLI(element)) {
      listItems.push(element);
    }
  }

  return listItems;
}

/**
 * Check if the provided node is an empty list (ul or ol without lis).
 *
 * @method isEmptyList
 * @public
 */
export function isEmptyList(
  node: HTMLUListElement | HTMLOListElement,
): boolean {
  if (!isList(node)) {
    return false;
  }

  // Sometimes lists may contain other stuff then lis. If so, we ignore this because illegal.
  for (let x = 0; x < node.children.length; x++) {
    if (isLI(node.children[x])) {
      return false;
    }
  }

  return true;
}

/**
 * TODO: Is this used anywhere? This seems badly named and was undocumented.
 *
 * @method isIgnorableElement
 * @deprecated
 * @public
 */
export function isIgnorableElement(node: Text): boolean {
  return (
    isTextNode(node) &&
    node.parentElement !== null &&
    tagName(node.parentElement) === 'ul'
  );
}

/**
 * Insert node b after node a.
 *
 * @method insertNodeBAfterNodeA
 * @deprecated Use ChildNode.after.
 * @public
 */
export function insertNodeBAfterNodeA(
  _parent: HTMLElement,
  nodeA: ChildNode,
  nodeB: ChildNode,
) {
  nodeA.after(nodeB);
}

/**
 * Return lowercase tag name of a provided node or an empty string for non element nodes.
 *
 * @method tagName
 * @public
 */
export function tagName(node?: Node | null): string {
  if (!node) {
    return '';
  }

  return isElement(node) ? node.tagName.toLowerCase() : '';
}

/**
 * TODO: Where is this used?
 * Check if the node is a <br> tag or a block.
 *
 * @method isBlockOrBr
 * @public
 */
export function isBlockOrBr(node: HTMLElement): boolean {
  return tagName(node) === 'br' || isDisplayedAsBlock(node);
}

/**
 * Given an HTML string, convert it into DomElements.
 *
 * @method createElementsFromHtml
 * @public
 */
export function createElementsFromHTML(htmlString: string): ChildNode[] {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  return Array.from(div.childNodes);
}

/**
 * Find previous list item.
 *
 * @method findPreviousLi
 * @public
 */
export function findPreviousLi(currLI: HTMLLIElement): HTMLLIElement | null {
  let previousElement: Element | null = currLI;

  do {
    previousElement = previousElement.previousElementSibling;
  } while (previousElement && !isLI(previousElement));

  return previousElement ? previousElement : null;
}

/**
 * For a given node find the li containing it or null if it isn't contained in an li.
 *
 * @method getParentLI
 * @public
 */
export function getParentLI(node: Node): HTMLLIElement | null {
  if (!node.parentNode) {
    return null;
  }

  if (isLI(node.parentNode)) {
    return node.parentNode;
  }

  return getParentLI(node.parentNode);
}

/**
 * TODO: Where is this used? This seems very specific...
 * TODO: Why not just use tagName(list)?
 *
 * @method getListTagName
 * @deprecated
 * @public
 */
export function getListTagName(
  listElement: HTMLUListElement | HTMLOListElement,
): 'ul' | 'ol' {
  return tagName(listElement) === 'ul' ? 'ul' : 'ol';
}

/**
 * @method findFirstLi
 * @param {HTMLUListElement | HTMLOListElement} list The list node to search in.
 * @return {HTMLLIElement | undefined} First li of the given list.
 * @public
 */
export function findFirstLi(
  list: HTMLUListElement | HTMLOListElement,
): HTMLLIElement | undefined {
  if (!isList(list)) {
    throw new Error('Invalid argument: node is not a list.');
  }

  return Array.from(list.childNodes).find(isLI);
}

/**
 * @method findLastLi
 * @param {HTMLUListElement | HTMLOListElement} list The list node to search in.
 * @return {HTMLLIElement | undefined} Last li of the given list.
 * @public
 */
export function findLastLi(
  list: HTMLUListElement | HTMLOListElement,
): HTMLLIElement | undefined {
  if (!isList(list)) {
    throw new Error('Invalid argument: node is not a list.');
  }

  return Array.from(list.children).reverse().find(isLI);
}

/**
 * From an HTMLElement, check if it is visible or not.
 * Note: There is an edge case with 'visibility: hidden'.
 * See: https://stackoverflow.com/a/33456469/1092608 (the comments)
 * @method isVisibleElement
 * @public
 */
export function isVisibleElement(element: HTMLElement): boolean {
  // Stolen from https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js
  // SO likes this answer https://stackoverflow.com/a/33456469/1092608
  // Note: There is still some edge case (see comments): "This will return true for an element with visibility:hidden."
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}

/**
 * Utility to get the selection in a type-safe way. A null selection only happens when called on a
 * hidden iframe in Firefox, so it is ok to throw an error here instead of null checking everywhere.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
 */
export function getWindowSelection(): Selection {
  const selection = window.getSelection();
  if (!selection) {
    throw new Error(
      'Window selection not found. This is an error and does not mean' +
        'the selection was empty',
    );
  }

  return selection;
}

export function getPathFromRoot(to: Node, inclusive: boolean): Node[] {
  const path = [];
  let cur = to.parentNode;
  while (cur) {
    path.push(cur);
    cur = cur.parentNode;
  }
  path.reverse();
  if (inclusive) {
    path.push(to);
  }
  return path;
}

export function getLeafCount(node: Node) {
  if (node.childNodes.length) {
    let count = 0;
    node.childNodes.forEach((node) => {
      count += getLeafCount(node);
    });
    return count;
  } else {
    return 1;
  }
}

export function getLeafChildren(node: Node) {
  if (node.childNodes.length) {
    const leafs: Node[] = [...node.childNodes].flatMap((node) =>
      getLeafChildren(node),
    );
    return leafs;
  } else {
    return [node];
  }
}
