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
 * Handlers for list action.
 *
 * - It works only when current node is a textNode
 * - The general flow is dependent on two situation types:
 *     a. Either the current node is already in al list when this action is fired.
 *         (see further notes for wat it basically means 'being in a list')
 *     b. Not in a list, create a new list
 *
 * TODO
 * ----
 *  - some times empty textnodes are not included in logicalBlock. Probably an issue with the conditoin isDisplayedAsBlock
 */

/**
 * handles unordered list
 */
function unorderedListAction(rawEditor) {
  const filteredSuitableNodes = getSuitableNodesForListFromSelection(rawEditor);

  if (filteredSuitableNodes) {
    rawEditor.externalDomUpdate(
      'handle unorderedListAction',
      () => {
        rawEditor.createSnapshot();
        handleListAction(rawEditor, filteredSuitableNodes, unorderedListAction, 'ul')();
      },
      true
    );
  }
}

/**
 * handles ordered list
 */
function orderedListAction(rawEditor) {
  const filteredSuitableNodes = getSuitableNodesForListFromSelection(rawEditor);

  if (filteredSuitableNodes) {
    rawEditor.externalDomUpdate(
      'handle orderedListAction',
      () => {
        rawEditor.createSnapshot();
        handleListAction(rawEditor, filteredSuitableNodes, orderedListAction, 'ol')();
      },
      true
    );
  }
}

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
 * Boilerplate to handle List action
 * Both for UL and OL
 *
 * @method handleListAction
 * @param rawEditor: rawEditor
 * @param currentNodes: [domNodes] ordered from left to right, top to bottom
 * @param actionType: function defining the action.
 * @param listType: tagName as string (ol/ul)
 * @return function
 */
function handleListAction(rawEditor, currentNodes, actionType, listType) {
  return () => {
    // Create a new list when we don't have nodes in an existing list
    if (areInList(currentNodes).length == 0) {
      const logicalBlocks = currentNodes.map(getLogicalBlockContentsForNewList);
      const uniqueNodes = Array.from(new Set(logicalBlocks.flat()));
      const highestNodes = keepHighestNodes(uniqueNodes);
      /* We group the nodes by line, which will allow us to then insert each line
      as a bullet of the list:
          [ [Hello, <b>you</b>], [How are you ?], [<div>I am <i>fine</i></div>] ] */
      const groupedNodes = groupNodesByLogicalBlocks(highestNodes);
      insertNewList(rawEditor, groupedNodes, listType);
      return;
    }

    if (doesActionSwitchListType(currentNodes, actionType)) { // Create a list of a different type in a context that's a list => switching the type of the existing list
      let logicalBlocks = getLogicalBlockContentsSwitchListType(currentNodes);
      shuffleListType(rawEditor, logicalBlocks);
      return;
    }

    let logicalBlocks = getGroupedLogicalBlocks(currentNodes); // Last possible case: user wants to revert the existing list
    unindentLogicalBlockContents(rawEditor, logicalBlocks);
  };
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
 * Checks for each node of an array if it is in a list
 *
 * @method areInList
 * @param [Array] nodes The nodes to check
 * @return [Array] the nodes that are in a list
 */
function areInList(nodes) {
  return nodes.filter(node => {
    const domNode = node.richNode ? node.richNode.domNode : node;
    return isInList(domNode);
  });
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
 * Switches list type where currentNode is situated in.
 */
function shuffleListType(rawEditor, logicalBlockContents) {
  const currlistE = logicalBlockContents[0];
  const currlistType = getListTagName(currlistE);
  const targetListType = currlistType == 'ul' ? 'ol' : 'ul';
  const parentE = currlistE.parentNode;
  const allLIs = [...currlistE.children];

  const listE = document.createElement(targetListType);
  allLIs.forEach(li => listE.append(li));

  parentE.insertBefore(listE, currlistE);
  parentE.removeChild(currlistE);
}

function doesActionSwitchListType(nodes, listAction) {
  // We assume all the nodes belong to the same <ul>/<ol>
  const domNodes = nodes.map(node => node.richNode ? node.richNode.domNode : node);
  const firstDomNode = domNodes[0];
  const li = getParentLI(firstDomNode);
  const listE = li.parentElement;

  const listType = getListTagName(listE);
  if (listType == 'ul' && listAction == unorderedListAction) {
    return false;
  }
  if (listType == 'ol' && listAction == orderedListAction) {
    return false;
  }
  return true;
}

/**
 * Given a node, we want to grow a region (a list of nodes)
 * we consider sensible for inserting a new list
 *
 * CURRENT IMPLEMENTATION
 * ----------------------
 *
 * Best to use an example. "|" is cursor.
 * ```
 * <p>
 *  blabla<br>bloublou <span><a href="#"> foo | <br></a></span> test <div> a block </div>
 * </p>
 * ```
 *
 *  The region we return.
 *
 *  ```
 *  bloublou <span><a href="#"> foo | <br></a></span> test
 *  ```
 * @method getLogicalBlockContentsForNewList
 *
 * @param {Object} domNode where cursor is
 *
 * @return [Array] [domNode1, ..., domNodeN]
 *
 * @public
 */
function getLogicalBlockContentsForNewList(node) {
  let baseNode = returnParentNodeBeforeBlockElement(node);

  //if the provided node is a block we consider this as sufficient region for building a list
  //TODO: <br> is taken here too, but probably too liberal
  if(isBlockOrBr(node)){
    return [ node ];
  }
  else {
    //left and right adjacent siblings should be added until we hit a br (before) and a block node (after).
    return growAdjacentRegionUntil(isBlockOrBr, isBlockOrBr, baseNode);
  }
}

/**
 * Given a node in a list, we want to grow a region (a list of nodes)
 * we consider sensible to for switching the type of list.
 * In this case, we return the parent list dom element where current
 * domNode is in.
 *
 * @method getLogicalBlockContentsSwitchListType
 *
 * @param {Object} domNode where cursor is
 *
 * @return [Array] [domNode1, ..., domNodeN]
 *
 * @public
 */
function getLogicalBlockContentsSwitchListType(nodes) {
  const domNodes = nodes.map(node => node.richNode ? node.richNode.domNode : node);
  const currLI = getParentLI(domNodes[0]); // No need to process all the list of nodes. From the first node we will be able to get the list element that we want to switch
  return [currLI.parentNode];
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

    if (!prevSibling || prevSibling.nodeType != Node.TEXT_NODE) return false;
  } else {
    let nextSibling = node.nextSibling;
    if (isList(node) && isInList(node) && !nextSibling) return true; //if <li><ul><li>pure nested list is ok </li></ul></li>
    if (!nextSibling || nextSibling.nodeType != Node.TEXT_NODE) return false;
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

export { unorderedListAction, orderedListAction, indentAction, unindentAction };
