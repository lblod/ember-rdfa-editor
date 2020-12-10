import { A } from '@ember/array';
import { PernetSelection, PernetSelectionBlock } from '@lblod/ember-rdfa-editor/editor/pernet'
import { RichNode } from '@lblod/ember-rdfa-editor/editor/raw-editor'
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
  let textContent = textNode.textContent || "";
  let content = [];
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
function insertTextNodeWithSpace(parentDomNode: HTMLElement, relativeToSibling: ChildNode | null = null, after: boolean = false): Text {
  let textNode = document.createTextNode(invisibleSpace);
  if (relativeToSibling) {
    if (after) {
      relativeToSibling.after(textNode);
    }
    else {
      relativeToSibling.before(textNode);
    }
  }
  else {
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
  let parent = node.parentElement;
  let baseNode: ChildNode = node;
  if (parent) {
    while (node.childNodes && node.childNodes.length > 0) {
      let nodeToInsert = node.childNodes[node.childNodes.length - 1];
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
function removeNode(node: ChildNode) {
  let parent = node.parentNode;
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
function isElement(node: Node): node is Element {
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

function isDisplayedAsBlock(domNode: Element): boolean {
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
function smartSplitTextNode(textNode: Text, splitAt: number): Array<HTMLElement> {
  let parent = textNode.parentElement;
  if (parent) {
    const textContent = textNode.textContent || "";
    let firstTextNode = document.createTextNode(textContent.slice(0, splitAt));
    let lastTextNode = document.createTextNode(textContent.slice(splitAt));
    let extraParent = parent.cloneNode(false) as HTMLElement;
    parent.replaceChild(firstTextNode, textNode);
    parent.after(extraParent)
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
    for (let el of node.parentElement.children) {
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
  for (let element of [...list.children]) {
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
  for (var x = 0; x < node.children.length; x++) {
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
};

/**
 * insert node b after node a
 * @method insertNodeBAfterNodeA
 * @deprecate use ChildNode.after
 * @public
 */
function insertNodeBAfterNodeA(_parent: HTMLElement, nodeA: ChildNode, nodeB: ChildNode) {
  nodeA.after(nodeB);
};

/**
 * return lowercased tagname of a provided node or an empty string for non element nodes
 * @method tagName
 * @public
 */
function tagName(node?: Element | null): string {
  if (!node) return '';
  return node.nodeType === node.ELEMENT_NODE ? node.tagName.toLowerCase() : '';
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
function createElementsFromHTML(htmlString: string): Array<Node> {
  let div = document.createElement('div');
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
  if (isLI(node.parentNode)) return (node.parentNode as HTMLLIElement);
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
  for (let { richNode, range } of selection.selections) {
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
      let isNotRootNode = function(richNode : RichNode) : boolean { return !!richNode.parent; };
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
  let actualNodes: Array<PernetSelectionBlock> = A();
  for (let possibleNode of nodes) {
    const containedInAnotherPossibleNode = nodes.some((otherNode) => otherNode !== possibleNode && otherNode.richNode.domNode.contains(possibleNode.richNode.domNode));
    if (!containedInAnotherPossibleNode) {
      actualNodes.push(possibleNode);
    }
  }
  return actualNodes;
}

/**
 * @method findLastLi
 * @public
 */
function findLastLi(list: HTMLUListElement | HTMLOListElement): HTMLLIElement | null {
  if (['ul', 'ol'].includes(tagName(list))) {
    const foundNode = Array.from(list.children).reverse().find((node) => tagName(node) === 'li');
    if (foundNode) {
      return foundNode as HTMLLIElement;
    }
    else {
      return null;
    }
  }
  else {
    throw `invalid argument, expected a list`;
  }
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
/**
 * Gets a CaretPosition from a set of view coordinates.
 * It will find the deepest node at that point, and give you
 * the node and the offset which you need to put the caret as close to that point as possible,
 * while still maintaining a valid caret position. Chrome and Firefox disagree on its
 * interface, but the polyfill is trivial.
 * */
function getCaretPositionFromPoint(x: number, y: number): CaretPosition | null {
  if (!document.caretPositionFromPoint) {
    var range = document.caretRangeFromPoint(x, y);
    if (range === null) return null;
    return {
      offset: range.startOffset,
      offsetNode: range.startContainer,
      getClientRect: range.getBoundingClientRect,
    };
  }
  return document.caretPositionFromPoint(x, y);
}
/**
 * Place the caret at point x, y. Caret will be positioned inside the deepest node at that point
 * at an offset which puts it closest to the x,y point
 * */
function setCaretOnPoint(x: number, y: number) {
  console.log(`Placing caret on ${x}, ${y}`);
  const caretPos = getCaretPositionFromPoint(x, y);
  if (!caretPos) {
    console.warn(`Could not place caret on ${x}, ${y}`);
    return;
  }
  const { offset, offsetNode } = caretPos;
  const selection = getWindowSelection();
  selection.collapse(offsetNode, offset);
}
/**
 * Get the bounding clientRect for the caret.
 * This also handles the cases where the caret is in a weird place
 * and therefore has no clientRect by default.
 * The returned rect should always be interpreted as being in front of the caret.
 * So when using this to store a location and later resetting it
 * use the "right" property as the x value.
 * */
function getCaretRect(): ClientRect {
  const range = getWindowSelection().getRangeAt(0);
  if (range.getClientRects().length > 0) {
    // no need to do anything special when the caret is
    // in a normal place
    return range.getBoundingClientRect();
  } else if (
    isElement(range.startContainer) &&
    range.startContainer.childNodes.length === 0
  ) {
    // caret is inside a completely empty element, selections don't like that
    const emptyText = new Text(invisibleSpace);
    range.startContainer.appendChild(emptyText);
    range.setStart(emptyText, 0);
    range.collapse(true);
    const rslt = range.getBoundingClientRect();
    emptyText.remove();
    return rslt;
  } else if (
    isTextNode(range.startContainer) &&
    range.startContainer.length === 0
  ) {
    // caret is inside an empty textnode
    range.startContainer.textContent = invisibleSpace;
    range.collapse(true);
    return range.getBoundingClientRect();
  } else if (isElement(range.startContainer)) {
    //caret is inside a non-empty element, but inbetween nodes.
    // we can get the rect of the node right before the element

    if (range.startOffset === 0) {
      const emptyText = new Text(invisibleSpace);
      range.startContainer.childNodes[0].before(emptyText);
      range.setStart(emptyText, 0);
      range.collapse(true);
      const result = range.getBoundingClientRect();
      emptyText.remove();
      return result;
    } else {
      const dummyRange = document.createRange();
      const previousNode =
        range.startContainer.childNodes[range.startOffset - 1];
      let result;

      if (isTextNode(previousNode)) {
        if (previousNode.length === 0) {
          previousNode.textContent = invisibleSpace;
        }
        dummyRange.setStart(previousNode, previousNode.length);
        dummyRange.collapse();
        result = dummyRange.getBoundingClientRect();
      } else {
        if(isElement(previousNode) && tagName(previousNode) === "br") {
          return previousNode.getBoundingClientRect();
        }
        const emptyText = new Text(invisibleSpace);
        previousNode.appendChild(emptyText);
        dummyRange.setStart(emptyText, 0);
        dummyRange.collapse();
        result = dummyRange.getBoundingClientRect();
        emptyText.remove();
      }

      return result;
    }
  } else {
    // There is no sensible fallback, so throwing is the only option here.
    // when this is hit, a new case should be added
    throw new Error("Unhandled caret case");
  }
}

/** Walk up the tree and find the first ancestor node which satisfies predicate,
 * starting from startNode and walking until rootNode is encountered.
 * If startNode satisfies the predicate, it will be returned, same with rootNode.
 * The predicate will recieve the currently visited node, and the previous one.
 * The second argument to the predicate will be undefined when visiting the first node.
 *
 * @param startNode the node to start from
 * @param rootNode the last node which will be tested
 * @param predicate the predicate to test
 * @returns the first ancestor which satisfies predicate, or null if none found
 */
function findFirstAncestorWhichSatisfies(
  startNode: Node,
  rootNode: Node,
  predicate: (visitedNode: Node, previousNode?: Node) => boolean
): Node | null {
  let previousNode;
  let currentNode = startNode;
  while (!predicate(currentNode, previousNode) && currentNode !== rootNode) {
    const parent = currentNode.parentNode;
    if (!parent) {
      throw new Error("Node has no parent and is not the rootNode");
    }

    previousNode = currentNode;
    currentNode = parent;
  }
  if (predicate(currentNode)) {
    return currentNode;
  } else {
    return null;
  }
}

/**
 * Go as deep down the tree as possible, selecting the first
 * childNode at every step until the node is a leafNode
 *
 * @param node: the node to start from
 * @returns the leafNode found by walking down the firstChild branch
 *
 */
function findDeepestFirstDescendant(node: Node): Node {
  let currentNode = node;
  while (currentNode.firstChild) {
    currentNode = currentNode.firstChild;
  }
  return currentNode;
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
  findLastLi,
  getWindowSelection,
  getCaretPositionFromPoint,
  setCaretOnPoint,
  getCaretRect,
  findFirstAncestorWhichSatisfies,
  findDeepestFirstDescendant

};
