import previousTextNode from './previous-text-node';
import nextTextNode from './next-text-node';
import { isElement } from '../dom-helpers';

/**
 * So, what is a lumpNode?
 * A (collection of) nodes which should behave as an unsplittelbe chunk; so you cannot type in it,
 *  you backspace it as a whole and the cursor should not enter.
 * Intially I called it blockNode, but since 'block' already means something in HTML, I had to look for alternatives.
 *
 * HOW TO USE IT
 * -------------
 * In the HTML-tree, the following would work.
 * <div property='http://lblod.data.gift/vocabularies/editor/isLumpNode'> whatever content. </div>
 *
 * TODO
 * ----
 * - 'property='http://lblod.data.gift/vocabularies/editor/isLumpNode': no prefixed URI will work.
 *   This due to performance reasons of MARAWA, which would slow evertything, as long as no incremental changes are supported.
 *  - wiring: there is currently a dichotomy between CE and RDFA editor, and even though this is contained in CE, whilst using RDFA here
 *            this means it probably should not belong here. So location will change.
 */

const LUMP_NODE_URI = 'http://lblod.data.gift/vocabularies/editor/isLumpNode';

function isInLumpNode(node:Node, rootNode: Node){
  if(getParentLumpNode(node, rootNode)){
    return true;
  }
  return false;
}

function getParentLumpNode(node: Node, rootNode: Node): Node | null{
  if(hasLumpNodeProperty(node)){
    return node;
  }
  if(node == rootNode){
    return null;
  }
  if(node.parentNode){
    return getParentLumpNode(node.parentNode, rootNode);
  }
  return null;
}

function getPreviousNonLumpTextNode(node: Node, rootNode: Node): Node | null{
  if(isInLumpNode(node, rootNode)){
    const parentLumpNode = getParentLumpNode(node, rootNode);
    const previousNode = previousTextNode(parentLumpNode, rootNode);
    if(!previousNode) return null;
    if (isInLumpNode(previousNode, rootNode))
      return getPreviousNonLumpTextNode(previousNode, rootNode);
    else
      return previousNode;
  }
  else
    return previousTextNode(node, rootNode);
}

function getNextNonLumpTextNode(node: Node, rootNode: Node): Node | null{
  if(isInLumpNode(node, rootNode)){
    const parentLumpNode = getParentLumpNode(node, rootNode);
    const nextNode = nextTextNode(parentLumpNode, rootNode);
    if (isInLumpNode(nextNode, rootNode))
      return getNextNonLumpTextNode(nextNode, rootNode);
    else
      return nextNode;
  }
  else
    return nextTextNode(node, rootNode);
}

function hasLumpNodeProperty(node: Node): node is HTMLElement{
  if(!isElement(node)) return false;
  if(!node.attributes) return false;
  if(!node.hasAttribute("property")) return false;

  const propertyVal = node.attributes.getNamedItem("property")?.value;
  if(!propertyVal) return false;
  if(propertyVal.indexOf(LUMP_NODE_URI) > -1) return true;
  return false;
}

function animateLumpNode(node: Element){
  let animationClass = 'lump-node-highlight';
  node.classList.add(animationClass);
  window.setTimeout(() => node.classList.remove(animationClass), 500);
}

/**
  * Flags the LumpNode for removal.
  * @method flagForRemoval
  */
function flagLumpNodeForRemoval(node: Node) {
  const rootNode = node.getRootNode();
  const lumpNode = getParentLumpNode(node, rootNode) as Element;
  lumpNode.setAttribute("data-flagged-remove", "complete");
}

/**
  * checks whether element is flagged for removal
  * @method isElementFlaggedForRemoval
  */
function isLumpNodeFlaggedForRemoval( element: Element ) : boolean {
  return element.getAttribute('data-flagged-remove') === "complete";
}
export { isInLumpNode, getParentLumpNode, hasLumpNodeProperty, getNextNonLumpTextNode, getPreviousNonLumpTextNode, animateLumpNode, flagLumpNodeForRemoval, isLumpNodeFlaggedForRemoval, LUMP_NODE_URI };
