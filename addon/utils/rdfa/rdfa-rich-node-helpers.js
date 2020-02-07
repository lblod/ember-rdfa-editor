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







// TODO: import those from select.js ?

/* HELPERS */

// Make an array of all filter criteria that support values
const singleFilterKeywords = ['resource', 'datatype'];

// Make an array of all filter criteria that support arrays
const listFilterKeywords = ['typeof', 'property'];

/**
* Validates if the RDFa context a block matches all filter criteria
* In case a criteria has multiple values, all values must appear on the same node
*     (TODO context scanner currently only supports multi-value on typeof)
* In case resource and type are defined, they must appear on the same node
* In case property and datatype are defined, they must appear on the same node
* In case resource/typeof and property are defined, property must appear as inner context
*   of the typeof/resource node without any other typeof/resource being defined in between
*/
function isMatchingContext(block, filter) {
  // Validates if the scope in which a given property appears matches the resource/typeof filter criteria
  // The function assumes the context that is passed is retrieved from the semantic node that contains the given
  // property as an RDFa attribute. Therefore we start walking the context array from end to start to find
  // the triple matching the given property.
  const isMatchingScopeForProperty = function(context, property, resource, types) {
    let i = context.length;
    let matchingTriple = null;

    while ( !matchingTriple && i > 0 ) {
      i--;
      if ( context[i].predicate == property )
        matchingTriple = context[i];
    }

    const subject = matchingTriple.subject;
    if (resource && subject != resource)
      return false;

    if ( types.length ) {
      const typesOfSubject = context.filter(t => t.subject == subject && t.predicate == 'a').map(t => t.object);
      const matchesAllTypes = types.reduce( (isMatch, t) => isMatch && typesOfSubject.includes(t) , true);
      if ( !matchesAllTypes )
        return false;
    }

    return true;
  };


  if ( filter.property.length || filter.datatype ) {
    let isMatch = isMatchingRdfaAttribute(block.semanticNode.rdfaAttributes, filter, ['property', 'datatype']);

    if ( isMatch && (filter.resource || filter.typeof.length) ) {
      // we already know the properties match and appear on the same node
      // Hence, they all have the same subject and it's sufficient to only pass the first property
      return isMatchingScopeForProperty(block.context, filter.property[0], filter.resource, filter.typeof);
    }

    return isMatch;
  } else if ( filter.resource || filter.typeof.length ) {
    return isMatchingRdfaAttribute(block.semanticNode.rdfaAttributes, filter, ['resource', 'typeof']);
  }

  return false; // no filter criteria defined?
}

/**
 * Validates if the RDFa attributes of a node matches a specifc set of keys
*/
function isMatchingRdfaAttribute(rdfaAttributes, filter, keys) {
  const isMatchingValue = function(rdfaAttributes, key, value) {
    if ( listFilterKeywords.includes(key) ) {
      return value.reduce( (isMatch, v) => isMatch && (rdfaAttributes[key] || []).includes(v) , true);
    } else {
      if ( key == 'resource') {
        return rdfaAttributes['resource'] == value || rdfaAttributes['about'] == value;
      } else {
        return rdfaAttributes[key] == value;
      }
    }
  };

  const nonEmptyKeys = keys.filter( key => filter[key] && filter[key].length );
  return nonEmptyKeys.reduce( (isMatch, key) => isMatch && isMatchingValue(rdfaAttributes, key, filter[key]), true);
}





export { getRdfaAttributes, isRdfaNode, isEmptyRdfaAttributes, enrichRichNodeWithRdfa, findRichNode, findUniqueRichNodes };
// export { getRdfaAttributes, isRdfaNode, isEmptyRdfaAttributes, enrichRichNodeWithRdfa, findUniqueRichNodes };
