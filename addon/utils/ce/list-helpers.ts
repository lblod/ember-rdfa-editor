import {
  findPreviousLi,
  getListTagName,
  getParentLI,
  isAllWhitespace,
  isBlockOrBr,
  isDisplayedAsBlock,
  isElement,
  isLI,
  isList,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { warn } from '@ember/debug';
import PernetRawEditor from '@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import { ParseError } from '@lblod/ember-rdfa-editor/utils/errors';

export function indentAction(rawEditor: PernetRawEditor): void {
  const filteredSuitableNodes = getSuitableNodesForListFromSelection(rawEditor);

  if (filteredSuitableNodes.length) {
    const handleAction = () => {
      rawEditor.createSnapshot();

      const groupedLogicalBlocks = getGroupedLogicalBlocks(
        filteredSuitableNodes,
        rawEditor.rootNode
      );
      const firstNodes = groupedLogicalBlocks.map((block) => block[0]);
      const currLis = firstNodes.map((node) => node.parentNode!);
      const currListElements = currLis.map((node) => node.parentNode!);
      const currListTypes = currListElements.map((node) =>
        getListTagName(node as HTMLUListElement | HTMLOListElement)
      );
      const previousLis = currLis.map((node) =>
        findPreviousLi(node as HTMLLIElement)
      );

      // Assuming all the indents are from the same parent list.
      insertNewList(
        rawEditor,
        groupedLogicalBlocks,
        currListTypes[0],
        previousLis[0]
      );
    };

    rawEditor.externalDomUpdate('handle indentAction', handleAction, true);
  }
}

export function unindentAction(rawEditor: PernetRawEditor): void {
  const filteredSuitableNodes = getSuitableNodesForListFromSelection(rawEditor);

  if (filteredSuitableNodes.length) {
    const handleAction = () => {
      rawEditor.createSnapshot();

      const groupedLogicalBlocks = getGroupedLogicalBlocks(
        filteredSuitableNodes,
        rawEditor.rootNode
      );
      unindentLogicalBlockContents(rawEditor, groupedLogicalBlocks);
    };

    rawEditor.externalDomUpdate('handle unindentAction', handleAction, true);
  }
}

/***************************************************
 * HELPERS
 ***************************************************/

/**
 * Gets the nodes that are suitable for an action from the editor.
 * Will get the current node if there is a cursor in the text.
 * In case of a selection, we return the nodes intersecting the selection.
 * Note: This is only a first step for the construction of the list.
 *       Further postprocessing is required.
 *
 * @method getSuitableNodesForListFromSelection
 * @param rawEditor
 * @return Array the filtered suitable nodes
 */
function getSuitableNodesForListFromSelection(
  rawEditor: PernetRawEditor
): Node[] {
  const selection = window.getSelection();

  if (selection && !selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    if (isElement(container)) {
      const children = Array.from(container.childNodes);
      return children.filter((node) => range.intersectsNode(node));
    } else {
      return [container];
    }
  } else {
    return rawEditor.currentNode ? [rawEditor.currentNode] : [];
  }
}

/**
 * From the suitable nodes given for the task get their logical
 * blocks, clean them to keep the highest non-all-whitespace nodes and group them
 * by same parent.
 *
 * TODO: Revisit this...
 * @method getGroupedLogicalBlocks
 * @param suitableNodes
 * @param rootNode
 * @return Array the group logical blocks
 */
function getGroupedLogicalBlocks(
  suitableNodes: Node[],
  rootNode: HTMLElement
): Node[][] {
  // For further postprocessing we need to unwrap nodes if they are LI or EditorRootNode.
  // TODO: Not clear anymore why...
  const unwrappedNodes = suitableNodes.map((domNode) => {
    if (tagName(domNode) === 'li' || domNode.isSameNode(rootNode)) {
      return [...domNode.childNodes];
    } else {
      return domNode;
    }
  });
  const flattenedNodes: Node[] = unwrappedNodes.flat();

  let eligibleNodes = flattenedNodes.filter((node) =>
    isEligibleForIndentAction(node)
  );
  eligibleNodes = eligibleNodes
    .map((node) => getLogicalBlockContentsForIndentationAction(node))
    .flat();

  const uniqueNodes = Array.from(new Set(eligibleNodes));
  const highestNodes = keepHighestNodes(uniqueNodes);

  return groupNodesByLogicalBlocks(highestNodes);
}

/**
 * Filtering out the nodes that have a parent in the array to avoid duplicated
 * information.
 *
 * @method keepHighestNodes
 * @param nodes
 * @return Array the highest nodes
 */
function keepHighestNodes(nodes: Node[]): Node[] {
  if (nodes.length === 1) {
    return nodes;
  }

  nodes = nodes.filter((node) => {
    return !(node.parentNode && nodes.includes(node.parentNode));
  });

  return nodes;
}

/**
 * Grouping the nodes belonging to the same logical group.
 * Two behaviours:
 * - In the case of a list, we group the nodes that have the same parent (<li>).
 * - In the other cases, we group the nodes belonging to the same line, so until
 *   we find a separation (end of a block or <br>).
 * The goal of the manoeuvre is to have an array of logical blocks that will be
 * handled together (for ex. if we indent <li><i>hello</i> it's <b>me</b>, the
 * three nodes <i>hello</i>, it's and <b>me</b>) will be treated as nodes
 * belonging the the same line.
 *
 * @method groupNodesByLogicalBlocks
 * @param nodes
 * @return Array Grouped logical blocks
 */
function groupNodesByLogicalBlocks(nodes: Node[]): Node[][] {
  let groupedNodes: Node[][] = [];
  if (tagName(nodes[0].parentNode) === 'li') {
    /* CASE: (UN)INDENT
    We group together the nodes that have the same parent.

    Example (|- -| shows the selected zone):
        <ul>
          <li>He|-llo <b>friend</b></li>
          <li>Good-|bye</li>
        </ul>
    Will, when grown, give us three nodes: "Hello", "<b>friend</b>" and "Goodbye".
    The first two have the same parent, we want to group them (they form a line).
    The third one is a line by himself, so we want it to be separated.
    The result will be: [[Hello, <b>friend</b>], [Goodbye]] */

    const parents = nodes.map((node) => node.parentNode).flat();
    const uniqueParentNodes = Array.from(new Set(parents));

    // We find the children of each parent.
    groupedNodes = uniqueParentNodes.map((parent) => {
      return nodes.filter((node) => node.parentNode === parent);
    });
  } else {
    /* CASE: NEW LIST
    We group together the nodes that belong to the same line.

    Example (|- -| shows the selected zone):
    The following HTML
        He|-llo <b>you</b>
        <br>
        How are you ?
        <div>I am <i>fin-|e</i></div>

    Will give the nodes:
    [Hello, <b>you</b>, <br>, How are you ?, <div>I am <i>fine</i></div>]

    We are going to separate them by logical lines by spotting the block elements
    and the line breaks <br>, to end up with:
    [[Hello, <b>you</b>], [How are you ?], [<div>I am <i>fine</i></div>]] */

    // Initialization with an empty array for the first line.
    groupedNodes.push([]);

    nodes.map((node) => {
      if (!isElement(node)) {
        throw new ParseError('Current node is not an element');
      }

      if (isBlockOrBr(node)) {
        if (tagName(node) !== 'br') {
          groupedNodes.push([node]);
        }

        // If we hit a block or a br, the following blocks will be of a new line.
        groupedNodes.push([]);
      } else {
        // If we don't hit a block or br, we're still in the same line so we push our node to the currently
        // building line.
        groupedNodes[groupedNodes.length - 1].push(node);
      }
    });
  }

  // We may generate too many blank lines above, so we remove them.
  return groupedNodes.filter((group) => group.length > 0);
}

/**
 * Checks whether node is in a list.
 *
 *   EXAMPLES NOT IN A LIST
 *   ----------------------
 *   ```
 *   | a some text
 *   ```
 *
 *   ```
 *   a some <span> t | ext </span>
 *   ```
 *
 *   EXAMPLES IN A LIST
 *   ------------------
 *   Note here: When in a nested list context, even if cursors is in block element, we return true.
 *   ```
 *   <ul>
 *    <li> a some <div> block element text | </div>  other text </li>
 *   </ul>
 *   ```
 *
 *   ```
 *   <ul>
 *     <li> some text
 *       <a href="#">an <i> italic | </i> link</a>
 *     </li>
 *   </ul>
 *   ```
 */
export function isInList(node: Node): boolean {
  let currNode = node.parentNode;

  while (currNode) {
    if (isLI(currNode)) {
      return true;
    }

    currNode = currNode.parentNode;
  }

  return false;
}

/**
 * Inserts a new list.
 *
 */
function insertNewList(
  rawEditor: PernetRawEditor,
  logicalListBlocks: Node[][],
  listType: 'ul' | 'ol' = 'ul',
  parentNode: HTMLLIElement | null
) {
  const newListElementLocation = logicalListBlocks[0][0];

  // If the list has a child list, we should add the new indent to this existing list
  // instead of creating a new one.
  let listElement = null;

  if (tagName(newListElementLocation.parentNode) !== 'li') {
    createNewList(
      logicalListBlocks,
      parentNode,
      newListElementLocation,
      listType
    );
  } else {
    const lastSelectedBlockLocationRef =
      logicalListBlocks[logicalListBlocks.length - 1][0];
    if (!isElement(lastSelectedBlockLocationRef)) {
      throw new ParseError('Current node is not an element');
    }

    const nextSibling = lastSelectedBlockLocationRef.nextElementSibling;
    const shouldMergeWithChildList =
      tagName(nextSibling) === 'ul' || tagName(nextSibling) === 'ol';

    if (shouldMergeWithChildList) {
      // Indent selection that is going to be at the same level as its child.
      listElement = nextSibling;
      mergeWithChildList(logicalListBlocks, listElement);
    } else {
      // Regular.
      listElement = document.createElement(listType);
      indentRegularCase(
        logicalListBlocks,
        parentNode,
        listElement,
        newListElementLocation
      );
    }
  }

  // If selection, we set the cursor at the end of the selection.
  if (rawEditor.currentSelection) {
    rawEditor.setCurrentPosition(rawEditor.currentSelection[1]);
  }

  if (listElement) {
    makeLogicalBlockCursorSafe([listElement]);
  }
}

/**
 * Unindents logical block contents from context it resides in.
 */
function unindentLogicalBlockContents(
  rawEditor: PernetRawEditor,
  logicalBlockContents: Node[][],
  moveOneListUpwards = false
) {
  logicalBlockContents.forEach((block) => {
    const currLi = getParentLI(block[0]);
    if (currLi === null) {
      return;
    }

    const listElement = currLi.parentNode;
    if (!listElement) {
      return;
    }

    const listType = getListTagName(
      listElement as HTMLUListElement | HTMLOListElement
    );
    const parentElement = listElement.parentNode;
    const allLis = [...listElement.children];

    if (!currLi || !listElement || !parentElement) {
      warn('No wrapping LI/List/Parent of list found!', {
        id: 'list-helpers:unindentLIAndSplitList',
      });
      return;
    }

    const [LisBefore, LisAfter] = siblingsBeforeAndAfterLogicalBlockContents(
      allLis,
      [currLi]
    );
    let [siblingsBefore, siblingsAfter] =
      siblingsBeforeAndAfterLogicalBlockContents([...currLi.childNodes], block);

    siblingsBefore = siblingsBefore.filter(
      (node) => !isAllWhitespace(node as Text)
    );
    siblingsAfter = siblingsAfter.filter(
      (node) => !isAllWhitespace(node as Text)
    );

    block = makeLogicalBlockCursorSafe(block);
    [siblingsBefore, siblingsAfter] = [
      makeLogicalBlockCursorSafe(siblingsBefore),
      makeLogicalBlockCursorSafe(siblingsAfter),
    ];

    if (siblingsBefore.length > 0) {
      const li = createParentWithLogicalBlockContents(siblingsBefore, 'li');
      LisBefore.push(li);
    }

    if (siblingsAfter.length > 0) {
      const li = createParentWithLogicalBlockContents(siblingsAfter, 'li');
      LisAfter.unshift(li);
    }

    // If we don't need to move our logical block on list up, we will split the list in
    // two and make sure the logicalBlock resides in between.
    if (!moveOneListUpwards) {
      if (LisBefore.length > 0) {
        const listBefore = createParentWithLogicalBlockContents(
          LisBefore,
          listType
        );
        parentElement.insertBefore(listBefore, listElement);
      }

      block.forEach((n) => {
        // We are in highest list in context --> need brs to materialize the different
        // lines after removing the list structure.
        if (!isInList(listElement) && !moveOneListUpwards) {
          const br = document.createElement('br');
          parentElement.insertBefore(br, listElement);
        }

        parentElement.insertBefore(n, listElement);
      });

      if (LisAfter.length > 0) {
        const listAfter = createParentWithLogicalBlockContents(
          LisAfter,
          listType
        );
        parentElement.insertBefore(listAfter, listElement);
      }
    }

    // We are in highest list in context and we didn't start from nested context.
    if (!isInList(listElement) && !moveOneListUpwards) {
      makeLogicalBlockCursorSafe([listElement]);
      listElement.removeChild(currLi);
      parentElement.removeChild(listElement); // We don't need the original list.

      return;
    }

    // Current list is a nested list and the block needs to move one LI up.
    if (isInList(listElement) && !moveOneListUpwards) {
      listElement.removeChild(currLi);
      parentElement.removeChild(listElement); // We don't need the original list.
      unindentLogicalBlockContents(rawEditor, [block], true);
      return;
    }

    // We don't care whether our current list is nested. We just need to add the new LI's.
    if (moveOneListUpwards) {
      const li = createParentWithLogicalBlockContents(block, 'li');
      const newLIs = [...LisBefore, li, ...LisAfter];
      newLIs.forEach((n) => listElement.appendChild(n));
      listElement.removeChild(currLi);
    }
  });

  // If selection, we set the cursor at the end of the selection.
  if (rawEditor.currentSelection) {
    rawEditor.setCurrentPosition(rawEditor.currentSelection[1]);
  }
}

/**
 * Given a node in a nested list context, build the logicalBlock contents to perform
 * an unindent (i.e. unindent) action upon.
 *
 * CURRENT IMPLEMENTATION
 * ----------------------
 *
 * Best to use an example. "|" is cursor.
 *
 * Type case 1
 * -----------
 *
 * ```
 * <ol>
 *   <li>
 *     <ul>
 *       some text |
 *     </ul>
 *   </li>
 * </ol>
 * ```
 *
 *  The region we return.
 *
 *  ```
 *  some text |
 *  ```
 *
 * Type case 2
 * -----------
 *
 * ```
 * <ol>
 *   <li>
 *     <ul>
 *       some text <div> text in a block | </div>
 *     </ul>
 *   </li>
 * </ol>
 * ```
 *
 *  The region we return.
 *
 *  ```
 *  <div> text in a block | </div>
 *  ```
 * @method getLogicalBlockContentsForIndentationAction
 *
 *
 * @return [Array] [domNode1, ..., domNodeN]
 *
 * @public
 * @param node
 */
function getLogicalBlockContentsForIndentationAction(node: Node): Node[] {
  const currLi = getParentLI(node) || node;
  const currLiNodes = [...currLi.childNodes];
  const potentialBlockParentCurrentNode = currLiNodes.find(
    (n) => isDisplayedAsBlock(n) && n.contains(node)
  );

  if (potentialBlockParentCurrentNode) {
    return [potentialBlockParentCurrentNode];
  }

  const baseNode = returnParentNodeBeforeBlockElement(node);
  return growAdjacentRegionUntil(
    isDisplayedAsBlock,
    isDisplayedAsBlock,
    baseNode
  );
}

/**
 * Walk up the parents until a blockElement is matched.
 * Return the node of which the parent is the matching block element.
 * This is useful for fetching the span element in following example:
 * ```
 * <p>text <span> foo <a href="#"> current node | </a></span></p>
 * ```
 * The node we return.
 *
 * ```
 * <span> foo <a href="#"> current node | </a></span>
 * ```
 */
function returnParentNodeBeforeBlockElement(node: Node): Node {
  if (!node.parentNode || isDisplayedAsBlock(node.parentNode)) {
    return node;
  }

  return returnParentNodeBeforeBlockElement(node.parentNode);
}

/**
 * Given a node, we want to grow a region (a list of sibling nodes)
 * until we match a condition.
 */
function growAdjacentRegionUntil(
  conditionLeft: (node: Node) => boolean,
  conditionRight: (node: Node) => boolean,
  node: Node
) {
  const nodes = [];

  // Lefties.
  let currNode = node.previousSibling;
  while (currNode) {
    if (conditionLeft(currNode)) {
      break;
    }

    nodes.push(currNode);
    currNode = currNode.previousSibling;
  }

  // Left siblings have been added, put the provided node in the center.
  nodes.push(node);

  // Righties.
  currNode = node.nextSibling;
  while (currNode) {
    if (conditionRight(currNode)) {
      break;
    }

    nodes.push(currNode);
    currNode = currNode.nextSibling;
  }

  return nodes;
}

function isEligibleForIndentAction(node: Node): boolean {
  if (!isInList(node)) {
    warn('Indent only supported in context of list', {
      id: 'list-helpers:isEligibleForIndentAction',
    });
    return false;
  }
  return true;
}

function siblingsBeforeAndAfterLogicalBlockContents(
  allSiblings: Node[],
  logicalBlockContents: Node[]
): [Node[], Node[]] {
  const siblingsBefore: Node[] = [];
  const siblingsAfter: Node[] = [];

  let nodeListToUpdate = siblingsBefore;
  for (const node of allSiblings) {
    if (logicalBlockContents.some((n) => n.isSameNode(node))) {
      nodeListToUpdate = siblingsAfter;
      continue;
    }

    nodeListToUpdate.push(node);
  }

  return [siblingsBefore, siblingsAfter];
}

function createParentWithLogicalBlockContents(
  logicalBlockContents: Node[],
  type: string
): HTMLElement {
  const element = document.createElement(type);

  logicalBlockContents.forEach((n) => {
    // If it's the child of a <ul> but not the first, insert an invisible space to have a line break
    // (avoid having two dots on the same line).
    if (tagName(n.parentNode) === 'ul' && n.parentNode?.firstChild !== n) {
      element.appendChild(document.createTextNode(INVISIBLE_SPACE));
    }

    element.appendChild(n);
  });

  return element;
}

/**
 * Checks whether node is safe to put a cursor in. Checks either left or right from the node.
 */
function isNodeCursorSafe(node: Node, before = true): boolean {
  if (isTextNode(node) || isLI(node) || !node.parentNode) {
    return true;
  }

  if (before) {
    const prevSibling = node.previousSibling;
    // <li>
    //   <ul>
    //     <li>pure nested list is ok</li>
    //   </ul>
    // </li>
    if (isList(node) && isInList(node) && !prevSibling) {
      return true;
    }

    if (!prevSibling || !isTextNode(prevSibling)) {
      return false;
    }
  } else {
    const nextSibling = node.nextSibling;
    // <li>
    //   <ul>
    //     <li>pure nested list is ok</li>
    //   </ul>
    // </li>
    if (isList(node) && isInList(node) && !nextSibling) {
      return true;
    }

    if (!nextSibling || !isTextNode(nextSibling)) {
      return false;
    }
  }

  return true;
}

/**
 * Makes sure logicalBlock is cursor safe.
 * By checking the first BlockContentNode as being safe at its left.
 * The last node is checked at its right.
 * Adds invisibleWhitespace.
 * The in between elements are ignored.
 * (This function is basically something which should be executed at another level).
 */
function makeLogicalBlockCursorSafe(logicalBlockContents: Node[]): Node[] {
  if (logicalBlockContents.length === 0) {
    return logicalBlockContents;
  }

  const firstNode = logicalBlockContents[0];

  if (!isNodeCursorSafe(firstNode)) {
    const textNode = document.createTextNode(INVISIBLE_SPACE);
    firstNode.parentNode?.insertBefore(textNode, firstNode);

    logicalBlockContents = [textNode, ...logicalBlockContents];
  }

  const lastNode = logicalBlockContents.slice(-1)[0];
  if (isNodeCursorSafe(lastNode, false)) {
    return logicalBlockContents;
  }

  const textNode = document.createTextNode(INVISIBLE_SPACE);
  const nextSibling = lastNode.nextSibling;

  if (!nextSibling) {
    lastNode.parentNode?.append(textNode);
  } else {
    lastNode.parentNode?.insertBefore(textNode, nextSibling);
  }

  logicalBlockContents.push(textNode);
  return logicalBlockContents;
}

/**
 * @param logicalListBlocks Array of logical blocks belonging to the same line.
 * @param listElement The list element to which we append the indented blocks.
 */
function mergeWithChildList(
  logicalListBlocks: Node[][],
  listElement: Element | null
): void {
  if (!listElement) {
    return;
  }

  listElement.parentNode?.insertBefore(
    document.createTextNode(INVISIBLE_SPACE),
    listElement
  );

  const reversedLogicalListBlocks = logicalListBlocks.reverse();
  for (let i = 0; i < reversedLogicalListBlocks.length; i++) {
    const listBlocks = reversedLogicalListBlocks[i];
    let oldLi = null;
    if (listBlocks[0]) {
      oldLi = listBlocks[0].parentNode as HTMLElement;
    }

    const li = document.createElement('li');
    listElement.prepend(li);
    listBlocks.forEach((n) => {
      li.appendChild(n);
    });

    if (i !== 0 && oldLi) {
      oldLi.remove();
    }
  }
}

/**
 * @param logicalListBlocks Array of logical blocks belonging to the same line.
 * @param parentNode If provided, the parent node where we want to insert the list in.
 * @param listElement The list element to which we append the indented blocks.
 * @param newListElementLocation If no parent node, it's the element from which
 *                               we will deduce the position of our new list.
 */
function indentRegularCase(
  logicalListBlocks: Node[][],
  parentNode: HTMLLIElement | null,
  listElement: HTMLUListElement | HTMLOListElement,
  newListElementLocation: Node
) {
  if (parentNode) {
    // Indent -> regular -> parent node
    parentNode.append(document.createTextNode(INVISIBLE_SPACE));
    parentNode.append(listElement);
  } else {
    // Indent -> regular -> no parent node: Case when the selection is the first li of the list
    const parent = newListElementLocation.parentNode as HTMLElement; // <li> node

    // Create a ul -> fill the ul
    parent.append(document.createTextNode(INVISIBLE_SPACE));
    parent.append(listElement);
  }

  logicalListBlocks.forEach((listBlocks) => {
    const li = document.createElement('li');
    listElement.append(li);

    let oldLi = null;
    if (listBlocks[0]) {
      oldLi = listBlocks[0].parentNode as HTMLElement;
    }

    listBlocks.forEach((n) => li.appendChild(n));
    if (oldLi && oldLi.childElementCount === 0) {
      oldLi.remove();
    }
  });
}

/**
 * @param logicalListBlocks Array of logical blocks belonging to the same line.
 * @param parentNode If provided, the parent node where we want to insert the list in.
 * @param newListElementLocation If no parent node, it's the element from which
 *                               we will deduce the position of our new list.
 * @param listType The type of list to be inserted (ul / ol).
 */
function createNewList(
  logicalListBlocks: Node[][],
  parentNode: HTMLLIElement | null,
  newListElementLocation: Node,
  listType: 'ul' | 'ol'
) {
  const listElement = document.createElement(listType);

  if (parentNode) {
    parentNode.append(listElement);
  } else {
    const parent = newListElementLocation.parentNode;
    if (!parent) {
      warn('Lists assume a parent node', { id: 'list-helpers:insertNewList' });
      return;
    }

    parent.insertBefore(listElement, newListElementLocation);
  }

  logicalListBlocks.forEach((listBlocks) => {
    const li = document.createElement('li');
    listElement.append(li);
    listBlocks.forEach((n) => li.appendChild(n));
  });
}
