import { invisibleSpace, isAllWhitespace, isDisplayedAsBlock } from '@lblod/ember-rdfa-editor/utils/ce/dom-helpers';

/**
 * This method makes sure there is a valid textNode for caret.
 * If the rendered line solely consists out of whitespace text node(s), the carret won't behave as expected.
 * Especially in Firefox.
 * If the latter is the case, the provided textNode's content is replaced with an invisble whitespace.
 *
 * Notes
 * -----
 * Got inspiration from https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace
 * But needed to come up with own cases.
 *
 * @method ensureValidTextNodeForCaret
 * @public
 *
*/
export function ensureValidTextNodeForCaret(textNode : Text): Text {
  const parentElement = textNode.parentElement;
  const nextSibling = textNode.nextElementSibling;
  const previousSibling = textNode.previousElementSibling;
  //To be sure, we check for the whole neighbourhood of textNodes.
  const siblingsTextNodeNeighborhood = growAdjacentTextNodeNeighborhood(textNode);

  if(isWhiteSpaceTextNodesArray(siblingsTextNodeNeighborhood)){

    if (previousSibling && isDisplayedAsBlock(previousSibling)){
      //TODO: In theory the region could be merged.
      // But somewhere it feels better to minify the DOM operations. TBD
       textNode.textContent = invisibleSpace;
     }
     else if(nextSibling && isDisplayedAsBlock(nextSibling)){
       textNode.textContent = invisibleSpace;
     }
     else if(parentElement && isDisplayedAsBlock(parentElement)){
       textNode.textContent = invisibleSpace;
     }
  }
  return textNode;
}

/**
 * Starting from a textNode, get the neighorhood of adjacent TextNodes
 * @method ensureValidTextNodeForCaret
 * @public
 */
export function growAdjacentTextNodeNeighborhood(textNode: Text) : Array<Text> {
  let region = new Array<Text>();
  let currentNode = textNode;

  while(currentNode.previousSibling && currentNode.previousSibling.nodeType === Node.TEXT_NODE){
    region.push(currentNode.previousSibling);
    currentNode = currentNode.previousSibling;
  }

  region = [ ...region, textNode];

  currentNode = textNode;

  while(currentNode.nextSibling && currentNode.nextSibling.nodeType === Node.TEXT_NODE){
    region.push(currentNode.nextSibling);
    currentNode = currentNode.nextSibling;
  }

  return region;
}

/**
 * @method isWhiteSpaceTextNodesArray
 * @public
 */
export function isWhiteSpaceTextNodesArray(textNodes: Array<Text>) : boolean {
  return ! textNodes.some(textNode => ! isAllWhitespace(textNode) )
}
