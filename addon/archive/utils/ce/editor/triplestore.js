import { analyse as scanContexts } from '@lblod/marawa/rdfa-context-scanner';
/**
 * Given a resource, find all triples defined in it.
 * Note: this includes also the triples of the container wrapping these triples.
 * @param { String } 'http://a/expanded/resource/uri'
 * @return [ Object ] [{subject, predicate, object, datatype}]
 */
function triplesDefinedInResource( resourceUri ){
  let domNodes = scanContexts(this.rootNode).filter( c => c.context.slice(-1)[0].subject === resourceUri ).map( c => c.semanticNode.domNode );

  let contexts = domNodes.reduce((acc, d) => {
    return [...acc, ...scanContexts(d)];
  }, []);

  let triples = contexts.reduce((acc, d) => {
    return [...acc, ...d.context.slice(d.context.findIndex(isSubject(resourceUri)))]; //remove wrapping context.
  }, []);

  //Get unique values
  let triplesHash = triples.reduce( (acc, t) => {
    acc[JSON.stringify(sortedTripleObject(t))] = t;
    return acc;
  }, {});

  return Object.values(triplesHash);
}

function sortedTripleObject(triple){
  return Object.keys(triple).sort().reduce((acc, k) => {
    acc[k] = triple[k];
    return acc;
  } , {});
}

function isSubject(resourceUri){
  return ( triple ) => triple.subject === resourceUri;
}

export { triplesDefinedInResource };
