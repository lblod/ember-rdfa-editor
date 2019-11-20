import previousTextNode from './previous-text-node';
import nextTextNode from './next-text-node';

/**
 * So, what is a lumpNode?
 * A (collection of) nodes which should behave as an unsplittelbe chunk; so you cannot type in it,
 *  you backspace it as a whole and the cursor should not enter.
 * Intially I called it blockNode, but since 'block' already means something in HTML, I had to look for alternatives.
 * TODO: the initial idea was to put this code in rdfa-editor, since this is semantically annotated, 
 *       but it seems to be a tedious task.
 *       The idea is that eventually, both contenteditable and rdfa-editor should be merged.
 * @static
 * @public
 * @final
 */
const LUMP_NODE_URI = 'http://lblod.data.gift/vocabularies/editor/isBlockRemovalNode';

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
  //TODO: this direct string matching is done for performance reasons. Marawa should eventually support incremental scanning.
  if(node.attributes["property"].value.indexOf(LUMP_NODE_URI) > -1) return true;
  return false;
}

export { isInLumpNode, getParentLumpNode, hasLumpNodeProperty, getNextNonLumpTextNode, getPreviousNonLumpTextNode }
