import { analyse as scanContexts } from '@lblod/marawa/rdfa-context-scanner';

/**
 * Returns all triples encountered in a selection
 * NOTE: [EXPERIMENTAL] this function may move to another location.
 *
 * @param {Object} Selected contexts retuned by the selectContext method
 * @return { Array } Array of triples
 */
export default function triplesInSelection(selection) {
  console.warn('triplesInSelection: Experimental feature, may disappear in subsequent versions.'); // eslint-disable-line no-console
  let contexts = [];

  for(let context of selection.selections){
    contexts = [ ...contexts, ...scanContexts(context.richNode.domNode) ];
  }

  const triples = contexts.reduce( (acc, context) => {
    return [...acc, ...context.context];
  }, []);

    //Get unique values
  const triplesHash = triples.reduce( (acc, t) => {
    acc[JSON.stringify(_sortedTripleObject(t))] = t;
    return acc;
  }, {});

  return Object.values(triplesHash);
}

function _sortedTripleObject(triple){
  return Object.keys(triple).sort().reduce((acc, k) => {
    acc[k] = triple[k];
    return acc;
  } , {});
}
