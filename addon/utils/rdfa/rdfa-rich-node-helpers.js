import { set } from '@ember/object';
import { get } from '@ember/object';
import { rdfaKeywords } from '../config/rdfa';

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

export { getRdfaAttributes,isRdfaNode, isEmptyRdfaAttributes,  enrichRichNodeWithRdfa  };
