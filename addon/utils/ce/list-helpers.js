import {
  invisibleSpace,
  isDisplayedAsBlock,
  isList,
  isLI,
  getParentLI,
  getListTagName,
  findPreviousLi,
  isBlockOrBr,
  isAllWhitespace,
  tagName
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { warn } from '@ember/debug';

/**
 * handles indent Action
 */
function indentAction(rawEditor) {
  let filteredSuitableNodes = getSuitableNodesForListFromSelection(rawEditor);

  if (filteredSuitableNodes.length) {
    let handleAction = () => {
      rawEditor.createSnapshot();
      const groupedLogicalBlocks = getGroupedLogicalBlocks(filteredSuitableNodes);

      const firstNodes = groupedLogicalBlocks.map(block => block[0]);
      const currLis = firstNodes.map(node => node.parentNode);
      const currListEs = currLis.map(node => node.parentNode);
      const currlistTypes = currListEs.map(node => getListTagName(node));
      const previousLis = currLis.map(node => findPreviousLi(node));

      insertNewList(rawEditor, groupedLogicalBlocks, currlistTypes[0], previousLis[0]); // Assuming all the indents are from the same parent list
    };

    rawEditor.externalDomUpdate('handle indentAction', handleAction, true);
  }
}

/**
 * handles unindent Action
 */
function unindentAction(rawEditor) {
  let filteredSuitableNodes = getSuitableNodesForListFromSelection(rawEditor, 'indentation');

  if (filteredSuitableNodes.length) {
    let handleAction = () => {
      rawEditor.createSnapshot();
      const groupedLogicalBlocks = getGroupedLogicalBlocks(filteredSuitableNodes);

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
 * Will get the current node if there is a cursor in the text
 * In case of a selection, we return the nodes intersecting the selection.
 * Note: this is only a first step for the construction of the list.
 *       Further postprocessing is required
 *
 * @method getSuitableNodesForListFromSelection
 * @param rawEditor
 * @return Array the filtered suitable nodes
 */
function getSuitableNodesForListFromSelection(rawEditor) {
  const selection = window.getSelection();
  if(selection && !selection.isCollapsed){
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    if(container.nodeType == Node.ELEMENT_NODE){
      const children = Array.from(container.childNodes);
      const rootNodesFromRange = children.filter(node => range.intersectsNode(node));
      return rootNodesFromRange;
    }
    else {
      return [ container ];
    }
  }
  else {
    return rawEditor.currentNode? [ rawEditor.currentNode ] : [];
  }
}

/**
 * From the suitable nodes given for the task get their logical
 * blocks, clean them to keep the highest non-all-whitespace nodes and group them
 * by same parent.
 *
 * TODO: revisit this...
 * @method getGroupedLogicalBlocks
 * @param suitableNodes: [domNodes]
 * @return Array the group logical blocks
 */
function getGroupedLogicalBlocks(suitableNodes, rootNode) {
  //For further postprocessing we need to unwrap nodes if they are LI or EditorRootNode
  //TODO: not clear anymore why...
  let unwrappedNodes = suitableNodes.map(domNode => {
    if (tagName(domNode) == 'li' || domNode.isSameNode(rootNode)) {
      return [...domNode.childNodes];
    }
    else return domNode;
  });

  //The next processing steps expect a flattened list
  unwrappedNodes = unwrappedNodes.flat();

  //The next steps,filter out nodes not eligible for identation.
  let eligibleNodes = unwrappedNodes.filter(node => isEligibleForIndentAction(node));

  //For further post processing, we need the get the logical blocks
  eligibleNodes = eligibleNodes.map(node => getLogicalBlockContentsForIndentationAction(node));
  const uniqueNodes = Array.from(new Set(eligibleNodes.flat()));
  const highestNodes = keepHighestNodes(uniqueNodes);
  return groupNodesByLogicalBlocks(highestNodes);
}

/**
 * Filtering out the nodes that have a parent in the array to avoid duplicated
 * information
 *
 * @method keepHighestNodes
 * @param nodes
 * @return Array the highest nodes
 */
function keepHighestNodes(nodes) {
  if (nodes.length == 1) return nodes;

  nodes = nodes.filter(node => {
    return !(node.parentNode && nodes.includes(node.parentNode));
  });
  return nodes;
}

/**
 * Grouping the nodes belonging to the same logical group.
 * Two behaviours :
 * - In the case of a list, we group the nodes that have the same parent (<li>)
 * - In the other cases, we group the nodes belonging to the same line, so until
 *   we find a separation (end of a block or <br>)
 * The goal of the manoeuvre is to have an array of logical blocks that will be
 * handled together (for ex. if we indent <li><i>hello</i> it's <b>me</b>, the
 * three nodes <i>hello</i>, it's and <b>me</b>) will be treated as nodes
 * belonging the the same line.
 *
 * @method groupNodesByLogicalBlocks
 * @param nodes
 * @return Array Grouped logical blocks
 */
function groupNodesByLogicalBlocks(nodes) {
  let groupedNodes = [];
  if (tagName(nodes[0].parentNode) == 'li') { // (Un)indent case
    /* We group together the nodes that have the same parent.
    Example (|- -| shows the selected zone):
        <ul>
          <li>He|-llo <b>friend</b></li>
          <li>Good-|bye</li>
        </ul>
    Will, when grown, give us three nodes : "Hello", "<b>friend</b>" and "Goodbye".
    The first two have the same parent, we want to group them (they form a line).
    The third one is a line by himself, so we want it to be separated.
    The result will be [ [Hello, <b>friend</b>], [Goodbye] ] */

    const parents = nodes.map(node => node.parentNode);
    const uniqueParentNodes = Array.from(new Set(parents.flat()));

    groupedNodes = uniqueParentNodes.map(parent => { // We find the children of each parent
      return nodes.filter(node => node.parentNode == parent);
    });
  } else { // New list case
    /* We group together the nodes that belong to the same line.

    Example (|- -| shows the selected zone):
    The following HTML
        He|-llo <b>you</b>
        <br>
        How are you ?
        <div>I am <i>fin-|e</i></div>
    Will give the nodes
        [ Hello, <b>you</b>, <br>, How are you ?, <div>I am <i>fine</i></div> ]

    We are going to separate them by logical lines by spotting the block elements
    and the line breaks <br>, to end up with
        [ [Hello, <b>you</b>], [How are you ?], [<div>I am <i>fine</i></div>] ]*/

    groupedNodes.push([]); // Initialization with an empty array for the first line
    nodes.map(node => {
      if (isBlockOrBr(node)) {
        if (tagName(node) != "br") {
          groupedNodes.push([node]);
        }
        groupedNodes.push([]); // If we hit a block or a br, the following blocks will be of a new line
      } else {
        groupedNodes[groupedNodes.length - 1].push(node); // If we don't hit a block or br, we're still in the same line so we push our node to the currently building line
      }
    });
  }
  // We may generate too many blank lines above, so we remove them
  return groupedNodes.filter(group => group.length > 0);
}

/**
 * Checks whether node is in a list
 *
 *   EXAMPLES NOT IN A LIST
 *   ----------------------
 *
 *   ```
 *   | a some text
 *   ```
 *
 *    ```
 *    a some <span> t | ext </span>
 *    ```
 *
 *   EXAMPLES IN A LIST
 *   ------------------
 *
 *    Note here: when in a nested list context even if cursors is in block element,
 *    we return true
 *    ```
 *    <ul>
 *     <li> a some <div> block element text | </div>  other text </li>
 *    </ul>
 *    ```
 *
 *   ```
 *   <ul>
 *     <li> some text
 *         <a href="#">an <i> italic | </i> link</a>
 *     </li>
 *   </ul>
 *   ```
 */
function isInList(node) {
  let currNode = node.parentNode;
  while (currNode) {
    if (isLI(currNode)) return true;
    currNode = currNode.parentNode;
  }
  return false;
}


/**
 * Inserts a new list.
 *
 */
function insertNewList(rawEditor, logicalListBlocks, listType = 'ul', parentNode) {
  let newListElementLocation = logicalListBlocks[0][0];

  // If the list has a child list, we should add the new indent to this existing list instead of creating a new one
  let listE = null;

  if (tagName(newListElementLocation.parentNode) != "li") { // New list
    createNewList(logicalListBlocks, parentNode, newListElementLocation, listType);
  } else { // Indent case
    const lastSelectedBlockLocationRef = logicalListBlocks[logicalListBlocks.length - 1][0];
    const nextSibling = lastSelectedBlockLocationRef.nextElementSibling;
    const shouldMergeWithChildList = nextSibling && (tagName(nextSibling) == 'ul' || tagName(nextSibling) == 'ol');

    listE = document.createElement(listType);

    if (shouldMergeWithChildList) { // Indent selection that is going to be at the same level as its child
      listE = nextSibling;
      mergeWithChildList(logicalListBlocks, listE);
    } else { // Regular
      indentRegularCase(logicalListBlocks, parentNode, listE, newListElementLocation);
    }
  }

  if (rawEditor.currentSelection) { // If selection, we set the cursor at the end of the selection
    rawEditor.setCurrentPosition(rawEditor.currentSelection[1]);
  }
  makeLogicalBlockCursorSafe([listE]);
}

/**
 * Unindents logical block contents from context it resides in.
 */
function unindentLogicalBlockContents(rawEditor, logicalBlockContents, moveOneListUpwards = false) {
  logicalBlockContents.forEach(block => {
    let currLI = getParentLI(block[0]);
    if (currLI == null) return;

    let listE = currLI.parentNode;
    let listType = getListTagName(listE);
    let parentE = listE.parentNode;
    let allLIs = [...listE.children];

    if (!currLI || !listE || !parentE) {
      warn('No wrapping LI/List/Parent of list found!', {
        id: 'list-helpers:unindentLIAndSplitList'
      });
      return;
    }

    let [LIsBefore, LIsAfter] = siblingsBeforeAndAfterLogicalBlockContents(allLIs, [currLI]);
    let [siblingsBefore, siblingsAfter] = siblingsBeforeAndAfterLogicalBlockContents([...currLI.childNodes], block);

    siblingsBefore = siblingsBefore.filter(node => !isAllWhitespace(node));
    siblingsAfter = siblingsAfter.filter(node => !isAllWhitespace(node));

    block = makeLogicalBlockCursorSafe(block);
    [siblingsBefore, siblingsAfter] = [makeLogicalBlockCursorSafe(siblingsBefore), makeLogicalBlockCursorSafe(siblingsAfter)];

    if (siblingsBefore.length > 0) {
      let li = createParentWithLogicalBlockContents(siblingsBefore, 'li');
      LIsBefore.push(li);
    }

    if (siblingsAfter.length > 0) {
      let li = createParentWithLogicalBlockContents(siblingsAfter, 'li');
      LIsAfter = [li, ...LIsAfter];
    }

    // If we don't need to move our logical block on list up,
    // we will split the list in two and make sure the logicalBlock
    // resides in between
    if (!moveOneListUpwards) {
      if (LIsBefore.length > 0) {
        let listBefore = createParentWithLogicalBlockContents(LIsBefore, listType);
        parentE.insertBefore(listBefore, listE);
      }

      block.forEach( n => {
        if (!isInList(listE) && !moveOneListUpwards) { // We are in highest list in context --> need brs to materialize the different lines after removing the list structure
          let br = document.createElement('br');
          parentE.insertBefore(br, listE);
        }
        parentE.insertBefore(n, listE);
      });

      if (LIsAfter.length > 0) {
        let listAfter = createParentWithLogicalBlockContents(LIsAfter, listType);
        parentE.insertBefore(listAfter, listE);
      }
    }

    // We are in highest list in context, and we didn't start from nested context
    if (!isInList(listE) && !moveOneListUpwards) {
      makeLogicalBlockCursorSafe([listE]);
      listE.removeChild(currLI);
      parentE.removeChild(listE); //we don't need the original list
      return;
    }

    // Current list is a nested list, and the block needs to move one LI up
    if (isInList(listE) && !moveOneListUpwards) {
      listE.removeChild(currLI);
      parentE.removeChild(listE); //we don't need the original list
      unindentLogicalBlockContents(rawEditor, [block], true);
      return;
    }

    // We don't care wether our current list is nested. We just need to add the new LI's
    if (moveOneListUpwards) {
      let li = createParentWithLogicalBlockContents(block, 'li');
      let newLIs = [...LIsBefore, li, ...LIsAfter];
      newLIs.forEach( n => listE.appendChild(n) );
      listE.removeChild(currLI);
    }
  });

  if (rawEditor.currentSelection) { // If selection, we set the cursor at the end of the selection
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
 *</ol>
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
 *</ol>
 * ```
 *
 *  The region we return.
 *
 *  ```
 *  <div> text in a block | </div>
 *  ```
 * @method getLogicalBlockContentsForIndentationAction
 *
 * @param {Object} domNode where cursor is
 *
 * @return [Array] [domNode1, ..., domNodeN]
 *
 * @public
 */
function getLogicalBlockContentsForIndentationAction(node) {
  let currLI = getParentLI(node) || node;
  let currLiNodes = [...currLI.childNodes];
  let potentialBlockParentCurrentNode = currLiNodes.find(n => isDisplayedAsBlock(n) && n.contains(node));

  if (potentialBlockParentCurrentNode)
    return [potentialBlockParentCurrentNode];

  let baseNode = returnParentNodeBeforeBlockElement(node);

  return growAdjacentRegionUntil(isDisplayedAsBlock, isDisplayedAsBlock, baseNode);
}

/**
 * Walk up the parents until a blockElement is matched.
 * return the node of wich the parent is the matching
 * block element
 * This is useful for fetching the span element in following example:
 *   ```
 *    <p>
 *      text <span> foo <a href="#"> current node | </a></span>
 *    </p>
 *   ```
 *  The node we return.
 *
 *  ```
 *  <span> foo <a href="#"> current node | </a></span>
 *  ```
 */
function returnParentNodeBeforeBlockElement(node) {
  if (!node.parentNode) return node;

  if (isDisplayedAsBlock(node.parentNode)) {
    return node;
  }

  return returnParentNodeBeforeBlockElement(node.parentNode);
}

/**
 * Given a node, we want to grow a region (a list of sibling nodes)
 * until we match a condition
 */
function growAdjacentRegionUntil(conditionLeft, conditionRight, node) {
  let nodes = [];
  let currNode = node.previousSibling;

  //lefties
  while (currNode) {
    if (conditionLeft(currNode)) {
      break;
    }
    nodes.push(currNode);
    currNode = currNode.previousSibling;
  }

  //left siblings have been added, put the provided node in the center
  nodes.push(node);

  //righties
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

function isEligibleForIndentAction(node) {
  if (!isInList(node)) {
    warn('Indent only supported in context of list', {
      id: 'list-helpers:isEligibleForIndentAction'
    });
    return false;
  }
  return true;
}

function siblingsBeforeAndAfterLogicalBlockContents(allSiblings, logicalBlockContents) {
  let siblingsBefore = [];
  let siblingsAfter = [];
  let nodeListToUpdate = siblingsBefore;

  for (var node of allSiblings) {
    if (logicalBlockContents.some(n => n.isSameNode(node))) {
      nodeListToUpdate = siblingsAfter;
      continue;
    }
    nodeListToUpdate.push(node);
  }

  return [siblingsBefore, siblingsAfter];
}

function createParentWithLogicalBlockContents(logicalBlockContents, type) {
  let element = document.createElement(type);
  logicalBlockContents.forEach(n => {
    // If it's the child of a <ul> but not the first, insert an invisible space to have a line break (avoid having two dots on the same line)
    if ((tagName(n.parentNode) == 'ul') && (n.parentNode.firstChild != n)) {
      element.appendChild(document.createTextNode(invisibleSpace));
    }
    element.appendChild(n);
  });
  return element;
}

/**
 * Checks wether node is safe to put a cursor in. Checks either left or right from the node.
 */
function isNodeCursorSafe(node, before = true) {
  if (node.nodeType == Node.TEXT_NODE)
    return true;

  if (isLI(node))
    return true;

  let parent = node.parentNode;

  if (!parent)
    return true;

  if (before) {
    let prevSibling = node.previousSibling;

    if (isList(node) && isInList(node) && !prevSibling) return true; //if <li><ul><li>pure nested list is ok </li></ul></li>

    if (!prevSibling || prevSibling.modelNodeType != Node.TEXT_NODE) return false;
  } else {
    let nextSibling = node.nextSibling;
    if (isList(node) && isInList(node) && !nextSibling) return true; //if <li><ul><li>pure nested list is ok </li></ul></li>
    if (!nextSibling || nextSibling.modelNodeType != Node.TEXT_NODE) return false;
  }

  return true;
}


/**
 * Makes sure logicalBlock is cursor safe.
 * By checking the first BlockContentNode as being safe at its left.
 * The last node is checked at its right.
 * Adds invisibleWhitespace
 * The inbetween elements are ignored.
 * (This function is basically something which should be executed at anthoer level)
 */
function makeLogicalBlockCursorSafe(logicalBlockContents) {
  if (logicalBlockContents.length == 0 || logicalBlockContents[0] == null) return logicalBlockContents;

  let firstNode = logicalBlockContents[0];

  if (!isNodeCursorSafe(firstNode)) {
    let textNode = document.createTextNode(invisibleSpace);
    firstNode.parentNode.insertBefore(textNode, firstNode);
    logicalBlockContents = [textNode, ...logicalBlockContents];
  }

  let lastNode = logicalBlockContents.slice(-1)[0];

  if (isNodeCursorSafe(lastNode, false))
    return logicalBlockContents;

  let textNode = document.createTextNode(invisibleSpace);
  let nextSibling = lastNode.nextSibling;

  if (!nextSibling) {
    lastNode.parentNode.append(textNode);
  } else {
    lastNode.parentNode.insertBefore(textNode, nextSibling);
  }

  logicalBlockContents.push(textNode);

  return logicalBlockContents;
}

/**
 * @param logicalListBlocks Array of logical blocks belonging to the same line
 * @param listE The list element to which we append the indented blocks
 */
function mergeWithChildList(logicalListBlocks, listE) {
  listE.parentNode.insertBefore(document.createTextNode(invisibleSpace), listE);

  const reversedLogicalListBlocks = logicalListBlocks.reverse();
  for ( let i=0 ; i<reversedLogicalListBlocks.length ; i++) {
    const listBlocks = reversedLogicalListBlocks[i];
    let oldLi = null;
    if (listBlocks[0]) {
      oldLi = listBlocks[0].parentNode;
    }

    const li = document.createElement('li');
    listE.prepend(li);
    listBlocks.forEach(n => {
      li.appendChild(n);
    });

    if (i != 0) {
      oldLi.remove();
    }
  }
}

/**
 * @param logicalListBlocks Array of logical blocks belonging to the same line
 * @param parentNode If provided, the parent node where we want to insert the list in
 * @param listE The list element to which we append the indented blocks
 * @param newListElementLocation If no parent node, it's the element from which
 *                               we will deduce the position of our new list
 */
function indentRegularCase(logicalListBlocks, parentNode, listE, newListElementLocation) {
  if (parentNode) { // Indent -> regular -> parent node
    parentNode.append(document.createTextNode(invisibleSpace));
    parentNode.append(listE);
  } else { // Indent -> regular -> no parent node : Case when the selection is the first li of the list
    newListElementLocation = newListElementLocation.parentNode; // <li> node

    // Create a ul --> fill the ul
    newListElementLocation.append(document.createTextNode(invisibleSpace));
    newListElementLocation.append(listE);
  }

  logicalListBlocks.forEach(listBlocks => {
    const li = document.createElement('li');
    listE.append(li);
    let oldLi = null;
    if (listBlocks[0]) {
      oldLi = listBlocks[0].parentNode;
    }
    listBlocks.forEach(n => li.appendChild(n));
    if (oldLi && (oldLi.childElementCount == 0)) oldLi.remove();
  });
}

/**
 * @param logicalListBlocks Array of logical blocks belonging to the same line
 * @param parentNode If provided, the parent node where we want to insert the list in
 * @param newListElementLocation If no parent node, it's the element from which
 *                               we will deduce the position of our new list
 * @param listType The type of list to be inserted (ul / ol)
 */
function createNewList(logicalListBlocks, parentNode, newListElementLocation, listType) {
  const listE = document.createElement(listType);

  if (parentNode) {
    parentNode.append(listE);
  } else {
    let parent = newListElementLocation.parentNode;
    if (!parent) {
      warn('Lists assume a parent node', {
        id: 'list-helpers:insertNewList'
      });
      return;
    }
    parent.insertBefore(listE, newListElementLocation);
  }

  logicalListBlocks.forEach(listBlocks => {
    const li = document.createElement('li');
    listE.append(li);
    listBlocks.forEach(n => li.appendChild(n));
  });
}

export { indentAction, unindentAction, isInList };
