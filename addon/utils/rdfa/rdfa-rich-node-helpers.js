import { set } from '@ember/object';
import { get } from '@ember/object';
import { rdfaKeywords } from '../../config/rdfa';
import {
  singleFilterKeywords,
  listFilterKeywords,
  isMatchingContext,
  isMatchingRdfaAttribute
} from '../ce/editor/select';


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

// TODO: Document
let findRichNode = function(rdfaBlock, options={}) { // TODO: scope ?
  if ( !options.resource && !options.property && !options.typeof && !options.datatype ) {
    console.warn('At least one of the following parameters should be filled: resource, property, typeof or datatype'); // eslint-disable-line no-console
    return;
  }

  const filter = {};
  singleFilterKeywords.forEach( key => filter[key] = options[key] );
  listFilterKeywords.forEach( key => filter[key] = options[key] ? [ options[key] ].flat() : [] );

  // Check if the rdfaBlock has a suitable node in its context
  const hasSuitableNode = rdfaBlock.semanticNode.rdfaAttributes ? isMatchingContext(rdfaBlock, filter) : false;
  if (!hasSuitableNode) return null;

  // Find the suitable node by walking up the dom tree
  let suitableNode = null;
  let currentNode = rdfaBlock.semanticNode;

  while (!suitableNode) {
    if (currentNode.rdfaAttributes) {
      const nodeIsMatching = isMatchingRdfaAttribute(currentNode.rdfaAttributes, filter, ['resource', 'property', 'typeof', 'datatype']);
      if (nodeIsMatching) {
        suitableNode = currentNode;
      } else {
        currentNode = currentNode.parent;
      }
    } else {
      currentNode = currentNode.parent;
    }
  }
  return suitableNode;
}

// TODO: Document
let findUniqueRichNodes = function(rdfaBlocks, options={}) {
  let uniqueRichNodes = [];
  rdfaBlocks.forEach( rdfaBlock => {
    const richNode = findRichNode(rdfaBlock, options);
    if (richNode && !uniqueRichNodes.includes(richNode)) {
      uniqueRichNodes.push(richNode);
    }
  });
  return uniqueRichNodes;
}

export { getRdfaAttributes, isRdfaNode, isEmptyRdfaAttributes, enrichRichNodeWithRdfa, findRichNode, findUniqueRichNodes };
