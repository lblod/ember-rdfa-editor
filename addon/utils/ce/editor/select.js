import { positionInRange } from '@lblod/marawa/range-helpers';
import { analyse as scanContexts } from '@lblod/marawa/rdfa-context-scanner';

/**
 * Fake class to list helper functions
 * these functions can be used from the editor : editor.{function}
 *
 * SELECTION API RESULT
 *
 * This is an internal API.  It is subject to change.
 *
 * The idea of the selection API is that it yields the nodes on
 * which changes need to occur with their respective ranges.  This
 * means that we may return more than one node and that each of the
 * nodes might only have a sub-range selected on them.  We also need
 * to share sufficient information on the intention of the user, so
 * we can manipulate the contents correctly.
 *
 * The resulting entity has a top-level object which describes the
 * intention of the user.  Further elements of the selection contain
 * the effectively selected blobs on which we expect the user to
 * operate.
 *
 * @param {boolean} selectedHighlightRange Truethy iff the plugin
 *   selected a portion of the highlight, rather than a contextual
 *   element.
 * @param {[Selection]} selections A matched selection containing
 *   both the tag to which the change should be applied, as well as
 *   the RichNode of the change.
 * @param {[Number]} selections.range Range which should be
 *   highlighted.  Described by start and end.
 * @param {RichNode} selections.richNode Rich Node to which the
 *   selection applies.
 *
 * @module contenteditable-editor
 * @class Select
 * @constructor
 */

/**
 * Selects the current selection, for applying operations to.
 * Current selection may be a cursor or a range.
 *
 * @method selectCurrentSelection
 * @public
 */
function selectCurrentSelection() {
  // the following line was added to make sure the selection is set correctly before toggling a property
  // if text is selected with the mouse and the mouseUp event happens outside the editor we don't capture it at the moment, this is a workaround
  this.updateSelectionAfterComplexInput();
  const richNode = this.getRichNodeFor(this.currentNode);
  if (this.currentSelection[0] === this.currentSelection[1] && richNode) {
    // it's a collapsed selection, return the currentNode
    return { selections: [{ richNode, range: this.currentSelection }], selectedHighlightRange: this.currentSelection, collapsed: true  };
  }
  else {
    return selectHighlight.bind(this)(this.currentSelection);
  }
}

/**
 * Selects the highlighted range, or part of it, for applying
 * operations to.
 *
 * Without options, this method selects the full highlighted range
 * in order to apply operations to it.  The options hash can be used
 * to supply constraints:
 *
 * - { offset } : Array containing the left offset and right offset.
 *   Both need to be positive numbers.  The former is the amount of
 *   characters to strip off the left, the latter the amount of
 *   characters to strip off the right.
 * - TODO { regex } : Regular expression to run against the matching
 *   string.  Full matching string is used for manipulation.
 *
 * @method selectHighlight
 * @param {Array} region
 * @param {} options
 * @public
 */
function selectHighlight([start,end], options = {}) {

  if( options.offset ) {
    start += options.offset[0] || 0;
    end -= options.offset[1] || 0;
  }
  if( start > end ) {
    throw new Error(`Selection ${start}, ${end} with applied offset of ${options.offset} gives an index in which start of region is not before or at the end of the region`);
  }

  const selections = [];
  let nextWalkedNodes = [this.richNode];

  while( nextWalkedNodes.length ) {
    let currentNodes = nextWalkedNodes;
    nextWalkedNodes = [];
    for( let node of currentNodes ){
      if( !node.children || node.children.length == 0 ) {
        if (positionInRange(node.start, [start, end]) || positionInRange(node.end, [start,end])
            || positionInRange(start, node.region) || positionInRange(end, node.region) ) {
          // handle lowest level node
          if (node.region[1] > end && node.type === 'tag') {
            // element doens't fully match, not splitting tags at the moment
            console.debug('dropping tag', node); // eslint-disable-line no-console
          }
          else {
            selections.push( {
              richNode: node,
              range: [ Math.max( node.start, start ), Math.min( node.end, end ) ] } );
          }
        }
        else {
          // do nothing, it's not overlapping
        }
      }
      else {
        if (positionInRange(start, node.region) || positionInRange(end, node.region) || positionInRange(node.start, [start,end]) || positionInRange(node.end, [start,end]))
          node.children.forEach( (child) => nextWalkedNodes.push( child ) );
      }
    }
  }

  return {
    selectedHighlightRange: [start, end],
    selections: selections
  };
}

/**
 * Selects nodes based on an RDFa context that should be applied.
 *
 * Options for scope search default to 'auto'.
 *
 * Options for filtering:
 * - range: The range object describing the highlighted region.
 * - scope:
 *   - 'outer': Search from inner range and search for an item
 spanning the full supplied range or more.
 *   - 'inner': Search from outer range and search for an item which
 is fully contained in the supplied range.
 *   - 'auto': Perform a best effort to find the nodes in which you're
 interested.
 * - property: string of URI or array of URIs containing the property (or properties) which must apply.
 * - typeof: string of URI or array of URIs containing the types which must apply.
 * - datatype: string of URI containing the datatype which must apply.
 * - resource: string of URI containing the resource which must apply.
 * - content: string or regular expression of RDFa content.
 * - TODO attribute: string or regular expression of attribute available on the node.
 *
 * @method selectContext
 * @param {Array} region
 * @param {} options
 * @public
 */
function selectContext([start,end], options = {}) {
  if ( !options.scope ) {
    options.scope = 'auto';
  }

  if ( !['outer', 'inner', 'auto'].includes(options.scope) ) {
    throw new Error(`Scope must be one of 'outer', 'inner' or 'auto' but is '${options.scope}'`);
  }

  if ( start > end ) {
    throw new Error(`Selection ${start}, ${end} gives an index in which start of region is not before or at the end of the region`);
  }

  const filter = {};
  singleFilterKeywords.forEach( key => filter[key] = options[key] );
  // Make an array of all filter criteria that support arrays
  listFilterKeywords.forEach( key => filter[key] = options[key] ? [ options[key] ].flat() : [] );

  let rdfaBlocks = scanContexts( this.rootNode, [start, end] );

  let selections = [];

  if ( rdfaBlocks.length == 0 )
    return selections;

  let foundInnerMatch = false;

  if ( options.scope == 'inner' || options.scope == 'auto' ) {
    selections = filterInner(rdfaBlocks, filter, [start, end]);
    foundInnerMatch = selections.length > 0;
  }

  if ( options.scope == 'outer' || ( options.scope == 'auto' && !foundInnerMatch ) ) {
    selections = filterOuter(rdfaBlocks, filter, [start, end]);
  }

  return { selections };
}

// HELPERS

/**
 * List of keywords to filter contexts on that can only contain a single value
*/
const singleFilterKeywords = ['resource', 'datatype', 'content'];

/**
 * List of keywords to filter contexts on that can be either a single value or an array
*/
const listFilterKeywords = ['typeof', 'property'];

/**
 * Validates if the RDFa attributes of a node matches a specifc set of keys
 * TODO: allow RegEx to use on properties with multiple values
*/
function isMatchingRdfaAttribute(rdfaAttributes, filter, keys) {
  const isMatchingValue = function(rdfaAttributes, key, value) {
    // rdfaAttributes don't match 100% with the pernet keys.  We
    // should build an extensive map to compare the two and provide
    // that as a data object to query inside these functions.  The
    // current solution is a band-aid.
    const rdfaAttributesKey = key == "property" ? "properties" : key;

    if ( listFilterKeywords.includes(key) ) {
      return value.reduce( (isMatch, v) => isMatch && (rdfaAttributes[rdfaAttributesKey] || []).includes(v) , true);
    } else {
      if ( key == 'resource') {
        return rdfaAttributes['resource'] == value || rdfaAttributes['about'] == value;
      } else {
        if(!rdfaAttributes.hasOwnProperty(rdfaAttributesKey)) {
          return false;
        }
        if(value instanceof RegExp) {
          return rdfaAttributes[rdfaAttributesKey].match(value);
        } else {
          return rdfaAttributes[rdfaAttributesKey] == value;
        }
      }
    }
  };

  const nonEmptyKeys = keys.filter( key => filter[key] && (filter[key] instanceof RegExp || filter[key].length) );
  return nonEmptyKeys.reduce( (isMatch, key) => isMatch && isMatchingValue(rdfaAttributes, key, filter[key]), true);
}

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
      const matchesAllTypes = types.reduce( (isMatch, t) => isMatch && ((t instanceof RegExp && typesOfSubject.match(t)) || (typeof t === 'string' && typesOfSubject.includes(t))) , true);
      if ( !matchesAllTypes )
        return false;
    }

    return true;
  };

  let isMatch = true;
  let hasAnyFilters = false;
  if ( filter.property.length || filter.datatype ) {
    hasAnyFilters = true;
    isMatch = isMatchingRdfaAttribute(block.semanticNode.rdfaAttributes, filter, ['property', 'datatype']);

    if ( isMatch && (filter.resource || filter.typeof.length) ) {
      // we already know the properties match and appear on the same node
      // Hence, they all have the same subject and it's sufficient to only pass the first property
      isMatch = isMatchingScopeForProperty(block.context, filter.property[0], filter.resource, filter.typeof);
    }
  } else if ( filter.resource || filter.typeof.length ) {
    hasAnyFilters = true;
    isMatch = isMatchingRdfaAttribute(block.semanticNode.rdfaAttributes, filter, ['resource', 'typeof']);
  }

  if(isMatch && filter.content) {
    hasAnyFilters = true;
    isMatch = isMatchingRdfaAttribute(block.semanticNode.rdfaAttributes, filter, ['content']);
  }

  return isMatch && hasAnyFilters; // If no filter criteria matches nothing by default
}

/**
* Find rich nodes that strictly fall inside the requested range and match the filter criteria
*
* We will go over the list of RDFa blocks that strictly fall inside the request range and check whether they
* match the requested filter criteria. There is no need to start walking the tree of rich nodes attached to
* the semanticNode because other RDFa contexts will be represented by another RDFa block in the initial list of blocks.
* In case 2 matching semantic nodes are nested only the highest (ancestor) node is returned.
*/
function filterInner(blocks, filter, [start, end]) {
  // Add a selection to the list, but only keep selections for the highest nodes in the tree
  const updateSelections = function(selections, newSelection) {
    const isChildOfExistingSelection = selections.find( selection => selection.richNode.isAncestorOf(newSelection.richNode) );

    if ( !isChildOfExistingSelection ) {
      const updatedSelections = selections.filter( selection => !selection.richNode.isDescendentOf(newSelection.richNode) );
      updatedSelections.push(newSelection);
      return updatedSelections;
    } else { // the newSelection is a child of an existing selection. Nothing should happen.
      return selections;
    }
  };

  let selections = [];

  blocks
    .filter(block => block.semanticNode.rdfaAttributes)
    .filter(block => block.semanticNode.isInRegion(start, end))
    .forEach( function(block) {
      if ( isMatchingContext(block, filter) ) {
        const selection = {
          richNode: block.semanticNode,
          range: block.semanticNode.region,
          context: block.context
        };
        selections = updateSelections( selections, selection);
      }
    });

  return selections;
}

/**
* Find rich nodes that strictly contain the requested range and match the filter criteria
*
* We will go over the list of RDFa blocks that strictly contain the request range and check whether they
* match the requested filter criteria. There is no need to start walking the tree of rich nodes attached to
* the semanticNode because other RDFa contexts will be represented by another RDFa block in the initial list of blocks.
* In case 2 matching semantic nodes are nested only the lowest (child) node is returned.
*/
function filterOuter(blocks, filter, [start, end]) {
  // Add a selection to the list, but only keep selections for the lowest nodes in the tree
  const updateSelections = function(selections, newSelection) {
    const isAncestorOfExistingSelection = selections.find( selection => selection.richNode.isDescendentOf(newSelection.richNode) );

    if ( !isAncestorOfExistingSelection ) {
      const updatedSelections = selections.filter( selection => !selection.richNode.isAncestorOf(newSelection.richNode) );
      updatedSelections.push(newSelection);
      return updatedSelections;
    } else { // the newSelection is an ancestor of an existing selection. Nothing should happen.
      return selections;
    }
  };

  let selections = [];

  blocks
    .filter(block => block.semanticNode.rdfaAttributes)
    .filter(block => block.semanticNode.containsRegion(start, end))
    .forEach( function(block) {
      if ( isMatchingContext(block, filter) ) {
        const selection = {
          richNode: block.semanticNode,
          range: block.semanticNode.region,
          context: block.context
        };
        selections = updateSelections(selections, selection);
      }
    });

  return selections;
}

export {
  selectCurrentSelection,
  selectHighlight,
  selectContext,
  singleFilterKeywords,
  listFilterKeywords,
  isMatchingContext,
  isMatchingRdfaAttribute
};
