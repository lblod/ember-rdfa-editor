/**
 * takes a tree and returns a list of nodes that match the given predicate
 *
 * @method flatMap
 *
 * @param {RichNode} RichNode
 * @param {Function} predicate
 * @param {Boolean} stopOnFirstMatch
 *
 * @return [Array] list of nodes matching the predicate function
 */
export default function flatMap(startNode, predicate, stopOnFirstMatch = false) {
  let matches = [];

  let currentScan;
  let nextScan = [startNode];

  while( nextScan.length ){
    currentScan = nextScan;
    nextScan = [];

    for( let node of currentScan ) {
      if (predicate(node)){
        if( stopOnFirstMatch )
          return [node];
        else
          matches.push(node);
      }

      if (node.children)
        nextScan.push( ...node.children );
    }
  }

  return matches;
}
