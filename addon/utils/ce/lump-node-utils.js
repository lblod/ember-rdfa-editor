import previousTextNode from './previous-text-node';
import nextTextNode from './next-text-node';

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
 *  - wiring: there is currently a dichtomy between CE and RDFA editor, and even though this is contained in CE, whilst using RDFA here
 *            this means it probably should not belong here. So location will change.
 */

const LUMP_NODE_URI = 'http://lblod.data.gift/vocabularies/editor/isLumpNode';

function isInLumpNode(node, rootNode){
  if(getParentLumpNode(node, rootNode)){
    return true;
  }
  return false;
}

function getParentLumpNode(node, rootNode){
  if(hasLumpNodeProperty(node)){
    return node;
  }
  if(node.isSameNode(rootNode)){
    return null;
  }
  if(node.parentNode){
    return getParentLumpNode(node.parentNode, rootNode);
  }
  return null;
}

function getPreviousNonLumpTextNode(node, rootNode){
  let newNode = previousTextNode(node, rootNode);
  if(isInLumpNode(newNode)){
    return getPreviousNonLumpTextNode(getParentLumpNode(newNode, rootNode), rootNode);
  }
  return newNode;
}

function getNextNonLumpTextNode(node, rootNode){
  let newNode = nextTextNode(node, rootNode);
  if(isInLumpNode(newNode)){
    return getNextNonLumpTextNode(getParentLumpNode(newNode, rootNode), rootNode);
  }
  return newNode;
}

function hasLumpNodeProperty(node){
  if(!node.attributes) return false;
  if(!node.attributes["property"]) return false;
  if(!node.attributes["property"].value) return false;
  if(node.attributes["property"].value.indexOf(LUMP_NODE_URI) > -1) return true;
  return false;
}

function animateLumpNode(node){
  let animationClass = 'lump-node-highlight';
  node.classList.add(animationClass);
  window.setTimeout(() => node.classList.remove(animationClass), 500);
}

export { isInLumpNode, getParentLumpNode, hasLumpNodeProperty, getNextNonLumpTextNode, getPreviousNonLumpTextNode, animateLumpNode }
