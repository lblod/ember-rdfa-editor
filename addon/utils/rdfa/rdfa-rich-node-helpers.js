import { set } from '@ember/object';
import { get } from '@ember/object';
import { rdfaKeywords } from '../../config/rdfa';

// TODO: content-editable should not be rdfa aware


/**
 * Get the RDFa attributes of a DOM node
 *
 * @method getRdfaAttributes
 *
 * @param {Node} domNode DOM node to get the RDFa attributes from
 *
 * @return {Object} Map of RDFa attributes key-value pairs
 *
 * @private
 */
let getRdfaAttributes = function(domNode) {
  const rdfaAttributes = {};

  if (domNode && domNode.getAttribute)
  {
    rdfaKeywords.forEach(function(key) {
      rdfaAttributes[key] = domNode.getAttribute(key);
    });

    if (rdfaAttributes['typeof'] != null)
      rdfaAttributes['typeof'] = rdfaAttributes['typeof'].split(' ');
  }

  rdfaAttributes['text'] = domNode.textContent;

  return rdfaAttributes;
};

/**
 * Enrich a rich node recursively with its RDFa attributes
 *
 * @method enrichRichNodeWithRdfa
 *
 * @param {RichNode} richNode Rich node to enrich with its RDFa attributes
 *
 * @private
 */
let enrichRichNodeWithRdfa = function(richNode) {
  const rdfaAttributes = getRdfaAttributes(get(richNode, 'domNode'));
  set(richNode,'rdfaAttributes', rdfaAttributes);

  if (get(richNode, 'children')) {
    get(richNode, 'children').forEach((child) => {
      enrichRichNodeWithRdfa(child);
    });
  }
};

/**
 * Returns whether a given RDFa attributes object is empty. This means no RDFa statement is set.
 *
 * @method isEmptyRdfaAttributes
 *
 * @param {Object} rdfaAttributes An RDFa attributes object
 *
 * @return {boolean} Whether the given RDFa attributes object is empty.
 *
 * @private
 */
let isEmptyRdfaAttributes = function(rdfaAttributes) {
  return rdfaKeywords
    .map(function (key) { return rdfaAttributes[key] == null; })
    .reduce(function(a, b) { return a && b; });
};


let isRdfaNode = function(richNode){
  enrichRichNodeWithRdfa(richNode);
  return !isEmptyRdfaAttributes(richNode.rdfaAttributes);
};

let findRichNode = function(rdfaBlock, { resource, property, type, datatype }) { // TODO: scope ?
  // TODO: check at least one criterion

  // Check if the rdfaBlock has a suitable node in its context
  const hasSuitableNode = rdfaBlock.context.filter( o => { // TODO Check all cases
    let condition = true;
    // We have at least one criterion so if it's not filled the condition will turn false
    condition = resource ? condition && o.subject.includes(resource) : condition;
    condition = property ? condition && o.property.includes(property): condition;
    condition = type ? condition && o.object.includes(type) : condition;
    condition = datatype ? condition && o.datatype.includes(datatype) : condition;
    return condition;
  }).length > 0;

  if (!hasSuitableNode) return null;

  // Find the suitable node by walking up the dom tree
  let besluitNode = null;
  let currentNode = rdfaBlock.semanticNode;

  while (!besluitNode) {
    if (currentNode.rdfaAttributes) {
      let condition = true;
      condition = resource ? condition && currentNode.rdfaAttributes.resource && currentNode.rdfaAttributes.resource.includes(resource) : condition;
      condition = property ? condition && currentNode.rdfaAttributes.property && currentNode.rdfaAttributes.property.includes(property): condition;
      condition = type ? condition && currentNode.rdfaAttributes.typeof && currentNode.rdfaAttributes.typeof.includes(type) : condition;
      condition = datatype ? condition && currentNode.rdfaAttributes.datatype && currentNode.rdfaAttributes.datatype.includes(datatype) : condition;

      if (condition) {
        besluitNode = currentNode;
      } else {
        currentNode = currentNode.parent;
      }
    } else {
      currentNode = currentNode.parent;
    }
  }

  return besluitNode;
}

// let findUniqueRichNodes = function(rdfaBlocks, { resource, property, typeof, datatype }) {
//
// }

export { getRdfaAttributes, isRdfaNode, isEmptyRdfaAttributes, enrichRichNodeWithRdfa, findRichNode };
