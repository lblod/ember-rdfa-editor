import { set } from '@ember/object';
import { warn } from '@ember/debug';
import { get } from '@ember/object';
import EmberObject from '@ember/object';
import {
  rdfaKeywords,
  prefixableRdfaKeywords,
  defaultPrefixes
} from '../config/rdfa';
import NodeWalker from '@lblod/ember-contenteditable-editor/utils/node-walker';

/**
* Scanner of the RDFa context of DOM nodes
*
* @module editor-core
* @class RdfaContextScanner
* @constructor
* @extends EmberObject
*/
export default EmberObject.extend({
  /**
   * Analyse the RDFa contexts of a specific region in a text
   *
   * @method analyse
   *
   * @param {Node} domNode Root DOM node containing the text
   * @param {[number,number]} region Region in the text for which RDFa contexts must be calculated
   *
   * @return {Array} Array of contexts mapping text parts from the specified region to their RDFa context
   *               A context element consists of:
   *               - region: Region in the text on which the RDFa context applies
   *               - context: RDFa context (an array of triple objects) of the region
   *               - text: Plain text of the region
   *
   * @public
   */
  analyse(domNode, [start, end]) {
    if (domNode == null || start < 0 || end < start)
      return [];

    const nodeWalker = NodeWalker.create({
      createRichNode( content ) {
        const newObject = Object.assign( {}, content );
        newObject.get = ( name ) => newObject[name];
        return newObject;
      },
      set( object, key, value ) {
        object[key] = value;
      }
    });
    const richNode = nodeWalker.processDomNode(domNode);

    this.enrichRichNodeWithRdfa(richNode);

    const rootRdfa = this.calculateRdfaToTop(richNode);
    this.expandRdfaContext(richNode, rootRdfa.context, rootRdfa.prefixes);

    const rdfaBlocks = this.flattenRdfaTree(richNode, [start, end]);

    // TODO take [start, end] arguments into account earlier in the process to improve performance
    let resultingBlocks;

    if (start && end) {
      resultingBlocks =
        rdfaBlocks
        .filter(function(b) {
          const [startBlock, endBlock] = [b.start, b.end || b.start];
          return (b.start >= start && b.end <= end)
            || ( b.start <= start && start <= b.end )
            || ( b.end <= end && end  <= b.end );
        });
    } else {
      resultingBlocks = rdfaBlocks;
    }

    return resultingBlocks.map( (b) => {
      // make sure contexts have a region
      this.set( b, 'region', [b.start, b.end] );
      return b;
    } );


  },

  /**
   * Enrich a rich node recursively with its RDFa attributes
   *
   * @method enrichRichNodeWithRdfa
   *
   * @param {RichNode} richNode Rich node to enrich with its RDFa attributes
   *
   * @private
  */
  enrichRichNodeWithRdfa(richNode) {
    const rdfaAttributes = this.getRdfaAttributes(richNode.domNode);
    this.set(richNode, 'rdfaAttributes', rdfaAttributes);

    if (richNode.children) {
      richNode.children.forEach((child) => {
        this.enrichRichNodeWithRdfa(child);
      });
    }
  },

  /**
   * Calculate the RDFa context from a given node to the top of the document
   *
   * @method calculateRdfaToTop
   *
   * @param {RichNode} richNode Rich node to start from
   *
   * @return {Object} Object containing the RDFa context and prefixes uptil the given node
   *
   * @private
  */
  calculateRdfaToTop(richNode) {
    const rootContext = [];
    const resolvedRootContext = [];
    let rootPrefixes = defaultPrefixes;

    const startNode = richNode.domNode;

    if (startNode.parentNode) { // start 1 level above the rootNode of the NodeWalker
      for(let node = startNode.parentNode; node.parentNode; node = node.parentNode) {
        const rdfaAttributes = this.getRdfaAttributes(node);
        if (!this.isEmptyRdfaAttributes(rdfaAttributes)) {
          rootContext.push(rdfaAttributes);
        }
      }

      rootContext.reverse(); // get rdfa attributes from top to bottom

      rootContext.forEach((rdfa) => {
        rootPrefixes = this.mergePrefixes(rootPrefixes, rdfa);
        const context = this.resolvePrefixes(rdfa, rootPrefixes);
        resolvedRootContext.push(context);
      });
    }

    return {
      context: resolvedRootContext,
      prefixes: rootPrefixes
    };
  },

  /**
   * Recursively expands the RDFa context of a rich node
   * I.e. resolve prefixes and augment RDFa context based on the prefixes and RDFa context of its parent
   *
   * @method expandRdfaContext
   *
   * @param {RichNode} richNode Rich node to expand the RDFa from
   * @param {Array} parentContext RDFa context of the node's parent
   * @param {Object} parentPrefixes RDFa prefixes defined at the node's parent level
   *
   * @private
  */
  expandRdfaContext(richNode, parentContext, parentPrefixes) {
    const nodeRdfaAttributes = richNode.rdfaAttributes;

    const prefixes = this.mergePrefixes(parentPrefixes, nodeRdfaAttributes);
    this.set(richNode,'rdfaPrefixes', prefixes);

    if (!this.isEmptyRdfaAttributes(nodeRdfaAttributes)) {
      const resolvedRdfaAttributes = this.resolvePrefixes(nodeRdfaAttributes, prefixes);
      this.set(richNode,'rdfaContext', parentContext.concat(resolvedRdfaAttributes));
    }
    else {
      this.set(richNode,'rdfaContext', parentContext);
    }

    if (richNode.children) {
      richNode.children.forEach((child) => {
        const context = richNode.rdfaContext;
        const prefixes = richNode.rdfaPrefixes;

        this.expandRdfaContext(child, context, prefixes);
      });
    }
  },

  /**
   * Flatten and reduce a rich node RDFa tree to an array of rich leaf nodes.
   * Only the text nodes falling in a specified region are returned.
   *
   * It is the goal to yield a flattened tree of RDFa statements.
   * Combining as many of them as possible.  Some examples on how we
   * intend to combine nodes will explain the intent better than a
   * long description.  The following cases represent a DOM tree.  The
   * o represents a tag which doesn't contain semantic content and
   * which in itself isn't rendered as a block.  The l represents a
   * logical block, these are blocks which render as a visually
   * separate block in html or which contain semantic content.  When
   * moving upward, we want to combine these nodes in order.  When
   * combining the nodes, we represent a non-mergeable logical block
   * by putting parens around it.
   *
   * For the two examples below, we explain the logic under the
   * drawing.
   *
   *
   *  1:        o      <-  (l) (oo) o (l)
   *           / \
   *  2:      l   o    <-  l = (l) (oo)  o = o l
   *         /|\  |\
   *  3:    l o o o l
   *
   *      -> l oo o l <-
   *
   * At the lowest level of nodes (3), we notice there's a logical
   * block, followed by two inline blocks.  The two inline blocks can
   * be combined.  Moving one level up (2), we see that these three
   * blocks are composed within a logical block.  Hence we can't
   * further combine the (oo) statement further up the hierarchy.
   * Moving to the right, we see an o and an l, which can't be further
   * combined.
   *
   *  -> (l) (o o) o l <-
   *
   *  1:        o      <-  (l) ooo (l)
   *           / \
   *  2:      o   o    <-  l = (l) oo   o = o (l)
   *         /|\  |\
   *  3:    l o o o l
   *
   *      -> l ooo l <-
   *
   * This case is different from the previous case.  On level 3, in
   * the left, we combine l o o to represent (l) oo.  The two
   * non-logical blocks can be combined.  As we move these to a level
   * up (2), we're still left with one logical block, and two
   * non-logical blocks.  The right of level 3 consists of o l.  These
   * too are stored in a non-logical block.  Hence we can combine them
   * to represent o (l).  Combining further at the top level (1), we
   * can combine all the three o as non of them is a logical block.
   * Because level 1 itself isn't a logical block either, we don't put
   * them between parens.  Hence, we end up with the blocks l ooo l.
   *
   * @method flattenRdfaTree
   *
   * @param {RichNode} richNode Rich node to flatten
   * @param {[number,number]} region Region in the text for which RDFa nodes must be returned
   *
   * @return {Array} Array of rich leaf text nodes falling in a specified region
   *
   * @private
   */
  flattenRdfaTree(richNode, [start, end]) {
    // TODO take [start, end] argumentns into account

    // ran before processing the current node
    const preprocessNode = (richNode) => {
      // does this node represent a logical block of content?
      this.set(richNode,'isLogicalBlock', this.nodeIsLogicalBlock( richNode ));
    };

    // ran when processing a single child node
    const processChildNode = (node) => {
      if ((node.start >= start && node.start <= end)
          || (node.end >= start && node.end <= end)
          || (node.start <= start && end <= node.end)) {
        this.flattenRdfaTree( node, [ start, end ] );
      } else {
        this.set(node, 'isLogicalBlock', false);
        this.set(node, 'isRdfaBlock', false);
        this.set(node, 'rdfaBlockList', []);
      }

    };

    // ran when we're finished processing all child nodes
    const finishChildSteps = (node) => {
      let rdfaBlockList = [];
      if ((node.start >= start && node.start <= end)
          || (node.end >= start && node.end <= end)
          || (node.start <= start && end <= node.end)) {
        rdfaBlockList = this.getRdfaBlockList( node );
      } else {
        rdfaBlockList = [];
      }

      this.set( node, 'rdfaBlocks', rdfaBlockList );
    };

    preprocessNode(richNode);
    (richNode.children || []).map( (node) => processChildNode(node) );
    finishChildSteps( richNode );

    return richNode.rdfaBlocks;
  },

  /**
   * Get an array of (combined) RDFa nodes for the supplied richNode.
   * Takes into account the properties of the richNode, and the
   * previously calculated rdfaNodeList of the children.
   *
   * @method getRdfaNodeList
   *
   * @param {RichNode} richNode The node for which to return the rdfaNodeList.
   *
   * @return {[RdfaBlock]} Array of rdfaBlock items.
   *
   * @private
   */
  getRdfaBlockList( richNode ){
    switch( richNode.type ){
    case "text":
      return this.createRdfaBlocksFromText( richNode );
    case "tag":
      return this.createRdfaBlocksFromTag( richNode );
    default:
      return [];
    }
  },

  /**
   * Returns an array of rdfaBlock items for the supplied richNode,
   * assuming that is a text node.
   *
   * @method createRdfaBlocksFromText
   *
   * @param {RichNode} richNode The text node for which to return the
   * rdfa blocks.
   *
   * @return {[RdfaBlock]} Array of rdfaBlock items.
   *
   * @private
   */
  createRdfaBlocksFromText( richNode ){
    return [{
      region: richNode.region,
      start: richNode.start,
      end: richNode.end || richNode.start,
      text: richNode.text,
      context: this.toTriples(richNode.rdfaContext),
      richNode: richNode,
      isRdfaBlock: richNode.isLogicalBlock
    }];
  },

  /**
   * Returns an array of rdfaBlock items for the supplied richNode,
   * assuming that is a tag node.
   *
   * The idea is to first get the rdfaBlocks from each of our children
   * and put them in a flat list.  We only need to check the first and
   * last children for combination, but we're lazy and try to combine
   * each of them.  In step three we clone this list, so we don't
   * overwrite what was previously used (handy for debugging).  Then
   * we possible overwrite the isRdfaBlock property, based on the
   * property of our own richNode.  If we are an rdfaBlock, none of
   * our children is still allowed to be combined after we ran the
   * combinator.
   *
   * @method createRdfaBlocksFromTag
   *
   * @param {RichNode} richNode RichNode for which the rdfaBlock items
   * will be returned.
   *
   * @return {[RdfaBlock]} Array of rdfaBlock items for this tag.
   *
   * @private
   */
  createRdfaBlocksFromTag( richNode ){
    // flatten our children
    const flatRdfaChildren =
          (richNode.children || [])
          .map( (child) => child.rdfaBlocks || [] )
          .reduce( (a,b) => a.concat(b), []);

    // map & combine children when possible
    const combinedChildren = this.combineRdfaBlocks( flatRdfaChildren );

    // clone children
    // const clonedChildren = combinedChildren.map( this.shallowClone );

    // override isRdfaBlock on each child, based on current node
    if( richNode.isLogicalBlock )
      combinedChildren.forEach( (child) => this.set( child, 'isRdfaBlock', true ) );

    // return new map
    return combinedChildren;
  },

  /**
   * Combines an array of rdfa blocks based on their properties.
   *
   * @method combineRdfaBlocks
   *
   * @param {[RichNode]} nodes Set of rich nodes for which we'll
   * combine the rdfaBlocks.
   *
   * @return {[RdfaBlock]} Array of rdfaBlocks after the combineable
   * ones were combined.
   *
   * @private
   */
  combineRdfaBlocks( nodes ){
    if( nodes.length <= 1 ) {
      return nodes;
    } else {
      // walk front-to back, build result in reverse order
      let firstElement, restElements;
      [ firstElement, ...restElements ] = nodes;
      const combinedElements =
            restElements.reduce( ([pastElement, ...rest], newElement) => {
              if( pastElement.isRdfaBlock || newElement.isRdfaBlock )
                return [newElement, pastElement, ...rest];
              else {
                const start = pastElement.start;
                const end = newElement.end || newElement.start;
                const combinedRdfaNode = {
                  region: [ start, end ],
                  start: start,
                  end: end,
                  text: pastElement.text.concat( newElement.text ),
                  context: pastElement.context,  // pick any of the two
                  richNode: [ newElement.richNode, pastElement.richNode],
                  isRdfaBlock: false // these two nodes are text nodes
                };
                return [combinedRdfaNode, ...rest];
              }
            }, [firstElement] );
      // reverse generated array
      combinedElements.reverse();
      return combinedElements;
    }
  },

  shallowClone( rdfaBlock ){
    return Object.assign( {}, rdfaBlock );
  },

  /**
   * Returns truethy if the supplied node represents a logical block.
   * We expect to override this as we discover new cases.  In general
   * we check whether there's RDFa defined on the element and/or
   * whether it is a block when rendered in the browser with the
   * current style.
   *
   * @method nodeIsLogicalBlock
   *
   * @param {RichNode} richNode Rich node which will be checked
   *
   * @return {boolean} True iff the node is a logical block
   *
   * @private
   */
  nodeIsLogicalBlock(richNode) {
    // non-tags are never blocks
    if( richNode.type != "tag" ) {
      return false;
    } else {
      if( ! this.isEmptyRdfaAttributes( richNode.rdfaAttributes )
          || this.isDisplayedAsBlock( richNode ) )
        return true;
      else
        return false;
    }
  },

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
  getRdfaAttributes(domNode) {
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
  },

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
  isEmptyRdfaAttributes(rdfaAttributes) {
    return rdfaKeywords
      .map(function (key) { return rdfaAttributes[key] == null; })
      .reduce(function(a, b) { return a && b; });
  },

  /**
   * Create a map of RDFa prefixes by merging an existing map of RDFa prefixes with new RDFa attributes
   *
   * @method mergePrefixes
   *
   * @param {Object} prefixes An map of RDFa prefixes
   * @param {Object} rdfAttributes An RDFa attributes object
   *
   * @return {Object} An new map of RDFa prefixes
   *
   * @private
   */
  mergePrefixes(prefixes, rdfaAttributes) {
    const mergedPrefixes = Object.assign({}, prefixes);

    if (rdfaAttributes['vocab'] != null) {
      mergedPrefixes[''] = rdfaAttributes['vocab'];
    }
    if (rdfaAttributes['prefix'] != null) {
      const parts = rdfaAttributes['prefix'].split(" ");
      for(let i = 0; i < parts.length; i = i + 2) {
        const key = parts[i].substr(0, parts[i].length - 1);
        mergedPrefixes[key] = parts[i + 1];
      }
    }

    return mergedPrefixes;
  },

  /**
   * Resolves the URIs in an RDFa attributes object with the correct prefix
   * based on a set of known prefixes.
   *
   * @method resolvePrefix
   *
   * @param {Object} rdfaAttributes An object of RDFa attributes
   * @param {Object} prefixes A map of known prefixes
   *
   * @return {Object} An RDFa attributes object containing resolved URIs
   *
   * @private
   */
  resolvePrefixes(rdfaAttributes, prefixes) {
    const clonedAttributes = Object.assign({}, rdfaAttributes);
    prefixableRdfaKeywords.forEach( (key) => {
      if (clonedAttributes[key] != null)
        clonedAttributes[key] = this.resolvePrefix(clonedAttributes[key], prefixes);
    });
    return clonedAttributes;
  },

  /**
   * Resolves a given (array of) URI(s) with the correct prefix (if it's prefixed)
   * based on a set of known prefixes.
   *
   * @method resolvePrefix
   *
   * @param {string|Array} uri An (array of) URI(s) to resolve
   * @param {Object} prefixes A map of known prefixes
   *
   * @return {string} The resolved URI
   *
   * @private
   */
  resolvePrefix(uri, prefixes) {
    const resolve = (uri) => {
      if (this.isFullUri(uri) || this.isRelativeUrl(uri)) {
        return uri;
      } else {
        const i = uri.indexOf(':');

        if (i < 0) { // no prefix defined. Use default.
          if (prefixes[''] == null)
            warn(`No default RDFa prefix defined`, { id: 'rdfa.missingPrefix' });
          uri = prefixes[''] + uri;
        } else {
          const key = uri.substr(0, i);
          if (prefixes[key] == null)
            warn(`No RDFa prefix '${key}' defined`, { id: 'rdfa.missingPrefix' });
          uri = prefixes[key] + uri.substr(i + 1);
        }

        return uri;
      }
    };

    if (Array.isArray(uri)) {
      return uri.map( u => resolve(u));
    } else {
      return resolve(uri);
    }
  },

  /**
   * Returns whether a given URI is a full URI.
   *
   * @method isFullUri
   *
   * @param {string} uri A URI
   *
   * @return {boolean} Whether the given URI is a full URI.
   *
   * @private
   */
  isFullUri(uri) {
    return uri.includes('://');
  },

  /**
   * Returns whether a given URI is a relative URI.
   *
   * @method isRelativeUrl
   *
   * @param {string} uri A URI
   *
   * @return {boolean} Whether the given URI is a relative URI.
   *
   * @private
   */
  isRelativeUrl(uri) {
    return uri.startsWith('#') || uri.startsWith('/') || uri.startsWith('./') || uri.startsWith('../');
  },

  /**
   * Transforms an array of RDFa attribute objects to an array of triples.
   * A triple is an object consisting of a subject, predicate and object.
   *
   * @method toTriples
   *
   * @param {Array} contexts An array of RDFa attribute objects
   *
   * @returns {Array} An array of triple objects
   *
   * @private
   */
  toTriples(rdfaAttributes) {
    const triples = [];

    let currentScope = null;

    rdfaAttributes.forEach(function(rdfa) {
      let nextScope = null;

      const triple = {};

      if (rdfa['about'] != null)
        currentScope = rdfa['about'];

      if (rdfa['content'] != null)
        triple.object = rdfa['content'];
      if (rdfa['datatype'] != null)
        triple.datatype = rdfa['datatype'];

      if (rdfa['property'] != null) {
        triple.predicate = rdfa['property'];

        if (rdfa['href'] != null)
          triple.object = rdfa['href'];

        if (rdfa['resource'] != null) {
          triple.object = rdfa['resource'];
          nextScope = rdfa['resource'];
        }

        if (triple.object == null)
          triple.object = rdfa.text;
      } else {
        if (rdfa['resource'] != null)
          currentScope = rdfa['resource'];
      }

      triple.subject = currentScope;
      if (triple.predicate != null) {
        triples.push(triple);
      }

      if (rdfa['typeof'] != null) {
        rdfa['typeof'].forEach(function(type) {
          triples.push({
            subject: rdfa['resource'], // create a blank node if resource == null
            predicate: 'a',
            object: type
          });
        });
      }

      // TODO: add support for 'rel' keyword: https://www.w3.org/TR/rdfa-primer/#alternative-for-setting-the-property-rel
      // TODO: add support for 'src' keyword

      // nextScope becomes the subject at the next level
      if (nextScope != null) {
        currentScope = nextScope;
      }
    });

    return triples;
  },

  /**
   * Whether an element is displayed as a block
   *
   * @method isDisplayedAsBlock
   *
   * @param {RichNode} richNode Node to validate
   *
   * @return {boolean} true iff the element is displayed as a block
   *
   * @private
   */
  isDisplayedAsBlock(richNode) {
    if( richNode.type != 'tag' )
      return false;

    const domNode = richNode.domNode;
    const displayStyle = window.getComputedStyle(domNode)['display'];
    return displayStyle == 'block' || displayStyle == 'list-item';
  },

  set( object, key, value ) {
    object[key] = value;
  }
});
