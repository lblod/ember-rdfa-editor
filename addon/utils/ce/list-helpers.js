import {
  invisibleSpace,
  isDisplayedAsBlock,
  isList,
  isLI,
  getParentLI,
  isTextNode,
  getListTagName,
  findPreviousLi,
  isBlockOrBr,
  findWrappingSuitableNodes,
  isAllWhitespace,
  tagName
} from './dom-helpers';
import { isAdjacentRange } from '@lblod/marawa/range-helpers';
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
 *
 * IMPLEMENTED BEHAVIOUR
 * ---------------------
 *   The '|' represents the cursor and gives an idea about the currentNode.
 *
 *  Some examples
 *
 *   case 1
 *   ------
 *   Call unorderedListAction x 1
 *   ```
 *   | a some text
 *   ```
 *   ```
 *   <ul>
 *     <li>| a some text</li>
 *   </ul>
 *   ```
 *
 *   case 2
 *   ------
 *   Call unorderedListAction x 1
 *   ```
 *   a some <span> t | ext </span>
 *   ```
 *   ```
 *   <ul>
 *     <li>a some <span> t | ext </span></li>
 *   </ul>
 *   ```
 *
 *   case 3
 *   ------
 *   Call indent x 1
 *   ```
 *    <ul>
 *     <li> a some <div> block element text | </div>  other text </li>
 *    </ul>
 *   ```
 *   ```
 *    <ul>
 *      <li> a some
 *        <ul>
 *          <li><div> block element text | </div></li>
 *        </ul>
 *        other text
 *      </li>
 *    </ul>
 *   ```
 *
 *   case 4
 *   ------
 *   Call unorderedListAction x 1
 *    ```
 *    A case |- with br-tag <br> new line. <br> we Will need to refine this.
 *    ```
 *
 *    ```
 *    <ul>
 *      <li>A case |- with br-tag <br> new line. <br> we Will need to refine this.</li>
 *    </ul>
 *    ```
 *
 *   case 6
 *   ------
 *   Call unorderedListAction or unindent x 1
 *   ```
 *   <ul>
 *     <li> The first </li>
 *     <li>| a some text</li>
 *     <li> the last </li>
 *   </ul>
 *   ```
 *
 *    ```
 *   <ul>
 *    <li> The first </li>
 *   </ul>
 *   | a some text
 *   <ul>
 *     <li> the last </li>
 *   </ul>
 *    ```
 *
 *   case 7
 *   ------
 *   Call unorderedListAction or unindent x 1
 *   ```
 *   <ul>
 *     <li>| a some text</li>
 *   </ul>
 *   ```
 *
 *    ```
 *    a some <span> t | ext </span>
 *    ```
 *
 *   case 8
 *   ------
 *   Call unorderedListAction or unindent x 1
 *   ```
 *    <ul>
 *     <li> a | some <div> block element text </div>  other text </li>
 *    </ul>
 *   ```
 *   ```
 *    <ul>
 *     <li> <div> block element text </div>  other text </li>
 *    </ul>
 *    a | some
 *   ```
 *
 *   case 9
 *   ------
 *   Call unorderedListAction or unindent x 1
 *   ```
 *    <ul>
 *      <li> item 1</li>
 *     <li>
 *       <ul>
 *          <li> subitem 1</li>
 *          <li> subitem | 2 </li>
 *          <li> subitem 3</li>
 *       </ul>
 *     </li>
 *     <li> item 2</li>
 *    </ul>
 *   ```
 *   ```
 *    <ul>
 *      <li> item 1</li>
 *     <li>
 *       <ul>
 *          <li> subitem 1</li>
 *       </ul>
 *     </li>
 *     <li> subitem | 2 </li>
 *     <li>
 *       <ul>
 *          <li> subitem 3</li>
 *       </ul>
 *     </li>
 *     <li> item 2</li>
 *    </ul>
 *   ```
 *
 *   case 10
 *   ------
 *   Call unorderedListAction or unindent x 1
 *
 *   ```
 *    <ul>
 *      <li> item 1</li>
 *     <li>
 *       <ul>
 *          <li> subitem 1</li>
 *          <li><div> subitem | 2 </div></li>
 *          <li> subitem 3</li>
 *       </ul>
 *     </li>
 *     <li> item 2</li>
 *    </ul>
 *   ```
 *   ```
 *    <ul>
 *      <li> item 1</li>
 *     <li>
 *       <ul>
 *          <li> subitem 1</li>
 *       </ul>
 *     </li>
 *     <li><div> subitem | 2 </div></li>
 *     <li>
 *       <ul>
 *          <li> subitem 3</li>
 *       </ul>
 *     </li>
 *     <li> item 2</li>
 *    </ul>
 *   ```
 *
 *   case 11
 *   ------
 *   Call unorderedListAction x 1
 *
 *   ```
 *   <ul>
 *     <li> The first </li>
 *     <li>| a some text</li>
 *     <li> the last </li>
 *   </ul>
 *   ```
 *
 *   ```
 *   <ol>
 *     <li> The first </li>
 *     <li>| a some text</li>
 *     <li> the last </li>
 *   </ol>
 */

/**
 * handles unordered list
 */
function unorderedListAction( rawEditor ) {
  const node = rawEditor.currentNode;
  let filteredSuitableNodes = null;

  if(isEligibleForListAction(node)) { // cursor placed in the text
    filteredSuitableNodes = node;
  } else if (rawEditor.currentSelection) { // selection of the text
    const range = rawEditor.currentSelection;
    const selection = rawEditor.selectHighlight(range);
    const suitableNodes = findWrappingSuitableNodes(selection);

    filteredSuitableNodes = suitableNodes.filter(node => {
      return !(isAdjacentRange(node.range, range) && node.split);
    })

    if (rawEditor.currentSelection) { // if selection, we set the cursor at the end of the selection
      rawEditor.setCurrentPosition(rawEditor.currentSelection[1]);
    }
  }

  if (filteredSuitableNodes) {
    rawEditor.externalDomUpdate(
      'handle unorderedListAction',
      handleListAction(rawEditor, filteredSuitableNodes, unorderedListAction, 'ul'),
      true
    );
  }
}

/**
 * handles ordered list
 */
function orderedListAction( rawEditor ) {
  const node = rawEditor.currentNode;
  let filteredSuitableNodes = null;

  if(isEligibleForListAction(node)) { // cursor placed in the text
    filteredSuitableNodes = node;
  } else if (rawEditor.currentSelection) { // selection of the text
    const range = rawEditor.currentSelection;
    const selection = rawEditor.selectHighlight(range);
    const suitableNodes = findWrappingSuitableNodes(selection);

    filteredSuitableNodes = suitableNodes.filter(node => {
      return !(isAdjacentRange(node.range, range) && node.split);
    })

    if (rawEditor.currentSelection) { // if selection, we set the cursor at the end of the selection
      rawEditor.setCurrentPosition(rawEditor.currentSelection[1]);
    }
  }

  if (filteredSuitableNodes) {
    rawEditor.externalDomUpdate(
      'handle unorderedListAction',
      handleListAction(rawEditor, filteredSuitableNodes, orderedListAction, 'ol'),
      true
    );
  }
}

/**
 * handles indent Action
 */
function indentAction( rawEditor ) {
  const node = rawEditor.currentNode;
  let filteredSuitableNodes = null;

  if(isEligibleForListAction(node)) { // cursor placed in the text
    filteredSuitableNodes = [node];

  } else if (rawEditor.currentSelection) { // selection of the text
    const range = rawEditor.currentSelection;
    const selection = rawEditor.selectHighlight(range);
    const suitableNodes = findWrappingSuitableNodes(selection);

    filteredSuitableNodes = suitableNodes.filter(node => {
      return !(isAdjacentRange(node.range, range) && node.split);
    })

    filteredSuitableNodes = reorderBlocks(filteredSuitableNodes).map(node => {
      const domNode = node.richNode.domNode;
      if (tagName(domNode) == 'li') {
        return [...domNode.childNodes];
      } else {
        return domNode;
      }
    }).flat();

    if (rawEditor.currentSelection) { // if selection, we set the cursor at the end of the selection
      rawEditor.setCurrentPosition(rawEditor.currentSelection[1]);
    }
  }

  if (filteredSuitableNodes) {
    let handleAction = () => {
      let logicalBlockContents = [];
      filteredSuitableNodes.forEach(node => {
        if(!(isEligibleForIndentAction(node) || (node.firstChild && isEligibleForIndentAction(node.firstChild)))) return; // firstChild : handles the case where we have a full li in the selection
        logicalBlockContents.push(getLogicalBlockContentsForIndentationAction(node));
      });
      logicalBlockContents = Array.from(new Set(logicalBlockContents.flat()));
      logicalBlockContents = keepHighestNodes(logicalBlockContents);

      const logicalListBlocksWithoutWhiteSpaces = logicalBlockContents.filter(block => {
        return !(isAllWhitespace(block));
      });

      const splitedLogicalBlocks = splitLogicalBlocks(logicalListBlocksWithoutWhiteSpaces);

      const firstNodes = splitedLogicalBlocks.map(block => block[0]);
      const currLis = firstNodes.map(node => node.parentNode);
      const currListEs = currLis.map(node => node.parentNode);
      const currlistTypes = currListEs.map(node => getListTagName(node));
      const previousLis = currLis.map(node => findPreviousLi(node));

      insertNewList(rawEditor, splitedLogicalBlocks, currlistTypes[0], previousLis[0]); // Assuming all the indents are from the same parent list

      currLis.forEach(node => node.remove());
    };

    rawEditor.externalDomUpdate('handle indentAction', handleAction, true);
  }
}

/**
 * handles unindent Action
 */
function unindentAction( rawEditor ) {
  const node = rawEditor.currentNode;
  let filteredSuitableNodes = null;

  if(isEligibleForListAction(node)) { // cursor placed in the text
    filteredSuitableNodes = [node];
  } else if (rawEditor.currentSelection) { // selection of the text
    const range = rawEditor.currentSelection;
    const selection = rawEditor.selectHighlight(range);
    const suitableNodes = findWrappingSuitableNodes(selection);

    filteredSuitableNodes = suitableNodes.filter(node => {
      return !(isAdjacentRange(node.range, range) && node.split);
    })

    filteredSuitableNodes = filteredSuitableNodes.map(node => node.richNode.domNode);

    if (rawEditor.currentSelection) { // if selection, we set the cursor at the end of the selection
      rawEditor.setCurrentPosition(rawEditor.currentSelection[1]);
    }
  }

  if (filteredSuitableNodes) {
    let handleAction = () => {
      let logicalBlockContents = [];
      filteredSuitableNodes.forEach(node => {
        if(!isEligibleForIndentAction(node)) return;
        logicalBlockContents.push(getLogicalBlockContentsForIndentationAction(node));
      });
      logicalBlockContents = Array.from(new Set(logicalBlockContents.flat()));
      logicalBlockContents = keepHighestNodes(logicalBlockContents);
      unindentLogicalBlockContents(rawEditor, logicalBlockContents);
    };

    rawEditor.externalDomUpdate('handle unindentAction', handleAction, true);
  }
}


/***************************************************
 * HELPERS
 ***************************************************/

/**
 * Boilerplate to handle List action
 * Both for UL and OL
 */
function handleListAction( rawEditor, currentNode, actionType, listType) {
  return () => {
    if(!isInList(currentNode)){
      let logicalBlockContents = [];
      if (Array.isArray(currentNode)) {
        currentNode.forEach(node => {
          logicalBlockContents.push({
            nodes: getLogicalBlockContentsForNewList(node.richNode.domNode),
            range: node.range
          });
        })
        logicalBlockContents = reorderBlocks(logicalBlockContents).map(block => block.nodes);
        logicalBlockContents = Array.from(new Set(logicalBlockContents.flat()));
        logicalBlockContents = keepHighestNodes(logicalBlockContents);
      } else {
        logicalBlockContents = getLogicalBlockContentsForNewList(currentNode);
      }

      const logicalListBlocksWithoutWhiteSpaces = logicalBlockContents.filter(block => {
        return !(isAllWhitespace(block) && tagName(block) != "br");
      });

      const splitedLogicalBlocks = splitLogicalBlocks(logicalListBlocksWithoutWhiteSpaces);

      insertNewList(rawEditor, splitedLogicalBlocks, listType);
      return;
    }

    if(doesActionSwitchListType(currentNode, actionType)){
      let logicalBlockContents = getLogicalBlockContentsSwitchListType(currentNode);
      shuffleListType(rawEditor, logicalBlockContents);
      return;
    }

    // TODO: check if it's used ?
    let logicalBlockContents = getLogicalBlockContentsForIndentationAction(currentNode);
    unindentLogicalBlockContents(rawEditor, logicalBlockContents);
  };
}

// TODO: documentation
function reorderBlocks(blocks) {
  return blocks.sort((a, b) => {
    if (a.range[0] > b.range[0])
      return true;
    if (a.range[0] == b.range[0])
      return a.range[1] > b.range[1]
  })
}

// TODO: documentation
function keepHighestNodes(nodes) {
  nodes = nodes.filter(node => {
    return !(node.parentNode && nodes.includes(node.parentNode));
  });
  return nodes;
}

// TODO: documentation
// Groups the blocks belonging to the same logical line group (a block is a line, a br splits two blocks, if the li parent is the same)
function splitLogicalBlocks(blocks) {
  let splitedBlocks = [];
  if (tagName(blocks[0].parentNode) == 'li') {
    let parentNodes = [];
    let replace = 0;
    blocks.forEach(block => {
      const parentNode = block.parentNode;
      if (!parentNodes.includes(parentNode)) {
        parentNodes.push(parentNode);
      } else {
        replace = 1; // If we already have an entry for the parent, we replace the current value (replace=1). Else we insert a brand new one
      }

      const index = parentNodes.indexOf(parentNode);
      const value = splitedBlocks[index] ? [...splitedBlocks[index], block] : [block];
      splitedBlocks.splice(index, replace, value);
      replace = 0;
    });
  } else {
    let i = 0;
    let tmp = [];

    blocks.forEach(block => {
      if (isBlockOrBr(block)) {
        if (tmp.length > 0) {
          splitedBlocks.splice(i, 0, tmp);
          i++;
        }
        if (tagName(block) != "br") {
          splitedBlocks.splice(i, 0, [block]);
          i++;
        }
        tmp = [];
      } else {
        tmp.push(block);
      }
    });

    if (tmp.length > 0) {
      splitedBlocks.splice(i, 0, tmp);
    }
  }
  return splitedBlocks;
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
function isInList( node ) {
  let currNode = node.parentNode;
  while(currNode){

    if(isLI(currNode)) return true;

    currNode = currNode.parentNode;
  }

  return false;
}

/**
 * Inserts a new list.
 *
 */
function insertNewList( rawEditor, logicalListBlocks, listType = 'ul', parentNode ) {
  let listELocationRef = logicalListBlocks[0][0];
  if (tagName(listELocationRef.parentNode) == 'li') {
    listELocationRef = listELocationRef.parentNode;
  }

  let listE = document.createElement(listType);

  if (parentNode) {
    parentNode.append(listE);
  }
  else {
    let parent = listELocationRef.parentNode;
    if(!parent){
      warn('Lists assume a parent node', {id: 'list-helpers:insertNewList'});
      return;
    }

    parent.insertBefore(document.createTextNode(invisibleSpace), listELocationRef);
    parent.insertBefore(listE, listELocationRef);
  }

  logicalListBlocks.forEach(listBlocks => {
    const li = document.createElement('li');
    listE.append(li);
    listBlocks.forEach(n => li.appendChild(n));
  });

  makeLogicalBlockCursorSafe([listE]);
 }

/**
 * Unindents logical block contents from context it resides in.
 */
function unindentLogicalBlockContents( rawEditor, logicalBlockContents, moveOneListUpwards= false ) {
  let currLI = getParentLI(logicalBlockContents[0]);
  let listE = currLI.parentNode;
  let listType = getListTagName(listE);
  let parentE = listE.parentNode;
  let allLIs = [...listE.children];

  if(!currLI || !listE || !parentE){
    warn('No wrapping LI/List/Parent of list found!', {id: 'list-helpers:unindentLIAndSplitList'});
    return;
  }

  let [LIsBefore, LIsAfter] = siblingsBeforeAndAfterLogicalBlockContents(allLIs, [currLI]);
  let [siblingsBefore, siblingsAfter] = siblingsBeforeAndAfterLogicalBlockContents([...currLI.childNodes], logicalBlockContents);

  logicalBlockContents = makeLogicalBlockCursorSafe(logicalBlockContents);
  [siblingsBefore, siblingsAfter] = [ makeLogicalBlockCursorSafe(siblingsBefore), makeLogicalBlockCursorSafe(siblingsAfter)];

  if(siblingsBefore.length > 0){
    let li = createParentWithLogicalBlockContents(siblingsBefore, 'li');
    LIsBefore.push(li);
  }

  if(siblingsAfter.length > 0){
    let li = createParentWithLogicalBlockContents(siblingsAfter, 'li');
    LIsAfter = [li, ...LIsAfter];
  }

  //If we don't need to move our logical block on list up,
  //we will split the list in two and make sure the logicalBlock
  //resides in between
  if(!moveOneListUpwards){

    if(LIsBefore.length > 0){
      let listBefore = createParentWithLogicalBlockContents(LIsBefore, listType);
      parentE.insertBefore(listBefore, listE);
    }

    logicalBlockContents.forEach(n => parentE.insertBefore(n, listE));

    if(LIsAfter.length > 0){
      let listAfter = createParentWithLogicalBlockContents(LIsAfter, listType);
      parentE.insertBefore(listAfter, listE);
    }
  }

  //We are in highest list in context, and we didn't start from nested context
  if(!isInList(listE) && !moveOneListUpwards){
    makeLogicalBlockCursorSafe([listE]);
    listE.removeChild(currLI);
    parentE.removeChild(listE); //we don't need the original list
    return;
  }

  //Current list is a nested list, and the block needs to move one LI up
  if(isInList(listE) && !moveOneListUpwards){
    listE.removeChild(currLI);
    parentE.removeChild(listE); //we don't need the original list
    unindentLogicalBlockContents(rawEditor, logicalBlockContents, true);
    return;
  }

  //We don't care wether our current list is nested. We just need to add the new LI's
  if(moveOneListUpwards){
    let li = createParentWithLogicalBlockContents(logicalBlockContents, 'li');
    let newLIs = [...LIsBefore, li, ...LIsAfter];
    newLIs.forEach(n => listE.appendChild(n));
    listE.removeChild(currLI);
  }
}

/**
 * Switches list type where currentNode is situated in.
 */
function shuffleListType( rawEditor, logicalBlockContents) {
  let currlistE = logicalBlockContents[0];
  let currlistType = getListTagName(currlistE);
  let targetListType = currlistType == 'ul'?'ol':'ul';
  let parentE = currlistE.parentNode;
  let allLIs = [...currlistE.children];

  let listE = document.createElement(targetListType);
  allLIs.forEach(li => listE.append(li));

  parentE.insertBefore(listE, currlistE);
  parentE.removeChild(currlistE);
}

function doesActionSwitchListType( node, listAction ) {
  let li = getParentLI(node);
  let listE = li.parentElement;
  let listType = getListTagName(listE);
  if(listType == 'ul' && listAction == unorderedListAction){
    return false;
  }
  if(listType == 'ol' && listAction == orderedListAction){
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
function getLogicalBlockContentsForNewList( node ) {
  let baseNode = returnParentNodeBeforeBlockElement(node);
  //left and right adjacent siblings should be added until we hit a br (before) and a block node (after).
  return growAdjacentNodesUntil(isBlockOrBr, isBlockOrBr, baseNode, true);
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
function getLogicalBlockContentsSwitchListType( node ) {
  let currLI = getParentLI(node);
  return [ currLI.parentNode ];
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

  if(potentialBlockParentCurrentNode)
    return [ potentialBlockParentCurrentNode ];

  let baseNode = returnParentNodeBeforeBlockElement(node);

  return growAdjacentNodesUntil(isDisplayedAsBlock, isDisplayedAsBlock, baseNode);
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
function returnParentNodeBeforeBlockElement( node ) {
  if(!node.parentNode) return node;

  if(isDisplayedAsBlock(node.parentNode)) {
    return node;
  }

  return returnParentNodeBeforeBlockElement(node.parentNode);
}

/**
 * Given a node, we want to grow a region (a list of sibling nodes)
 * until we match a condition
 */
function growAdjacentNodesUntil( conditionLeft, conditionRight, node, includeMyself=false ) {
  // TODO: remove includeMyself param
  // TODO: better documentation
  let nodes = [];

  let currNode = node;

  //lefties
  while(currNode){
    nodes.push(currNode); // We start from the base node, that we want to include in our selection, hence before the break
    if(conditionLeft(currNode)){
      break;
    }
    currNode = currNode.previousSibling ;
  }

  nodes.reverse();

  //righties
  currNode = node.nextSibling;
  while(currNode){
    if(conditionRight(currNode)){
      break;
    }
    nodes.push(currNode); // We want to check what the next sibling will be before adding it to the nodes, hence after the break
    currNode = currNode.nextSibling;
  }

  return nodes;
}

function isEligibleForListAction( node ){
  if(node==null || !isTextNode(node)){
    warn('Current action only supported for textNodes', {id: 'list-helpers:isEligibleForListAction'});
    return false;
  }
  return true;
}

function isEligibleForIndentAction( node ){
  if(!isInList(node)){
      warn('Indent only supported in context of list', {id: 'list-helpers:isEligibleForIndentAction'});
      return false;
  }
  return true;
}

function siblingsBeforeAndAfterLogicalBlockContents( allSiblings, logicalBlockContents ) {
  let siblingsBefore = [];
  let siblingsAfter = [];
  let nodeListToUpdate = siblingsBefore;

  for(var node of allSiblings){
    if(logicalBlockContents.some(n => n.isSameNode(node))){
      nodeListToUpdate = siblingsAfter;
      continue;
    }
    nodeListToUpdate.push(node);
  }

  return [ siblingsBefore, siblingsAfter ];
}

function createParentWithLogicalBlockContents( logicalBlockContents, type ){
  let element = document.createElement(type);
  logicalBlockContents.forEach(n => element.appendChild(n));
  return element;
}

/**
 * Checks wether node is safe to put a cursor in. Checks either left or right from the node.
 */
function isNodeCursorSafe( node, before = true ) {
  if(node.nodeType == Node.TEXT_NODE)
    return true;

  if(isLI(node))
    return true;

  let parent = node.parentNode;

  if(!parent)
    return true;

  if(before){
    let prevSibling = node.previousSibling;

   if(isList(node) && isInList(node) && !prevSibling) return true; //if <li><ul><li>pure nested list is ok </li></ul></li>

    if(!prevSibling || prevSibling.nodeType!= Node.TEXT_NODE) return false;
  }

  else {
    let nextSibling = node.nextSibling;
    if(isList(node) && isInList(node) && !nextSibling) return true; //if <li><ul><li>pure nested list is ok </li></ul></li>
    if(!nextSibling || nextSibling.nodeType!= Node.TEXT_NODE) return false;
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
function makeLogicalBlockCursorSafe( logicalBlockContents ) {
  if(logicalBlockContents.length == 0) return logicalBlockContents;

  let firstNode = logicalBlockContents[0];

  if(!isNodeCursorSafe(firstNode)){
    let textNode = document.createTextNode(invisibleSpace);
    firstNode.parentNode.insertBefore(textNode, firstNode);
    logicalBlockContents = [textNode, ...logicalBlockContents];
  }

  let lastNode = logicalBlockContents.slice(-1)[0];

  if(isNodeCursorSafe(lastNode, false))
    return logicalBlockContents;

  let textNode = document.createTextNode(invisibleSpace);
  let nextSibling = lastNode.nextSibling;

  if(!nextSibling){
    lastNode.parentNode.append(textNode);
  }
  else{
    lastNode.parentNode.insertBefore(textNode, nextSibling);
  }

  logicalBlockContents.push(textNode);

  return logicalBlockContents;
}

export { unorderedListAction, orderedListAction, indentAction, unindentAction }
