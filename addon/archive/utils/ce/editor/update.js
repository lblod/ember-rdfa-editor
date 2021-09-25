import { isAdjacentRange, isEmptyRange } from '@lblod/marawa/range-helpers';
import { replaceRichNodeWith, splitRichTextNode, wrapRichNode } from '../rich-node-tree-modification';
import { runInDebug } from '@ember/debug';
import { parsePrefixString } from '@lblod/marawa/rdfa-attributes';
import { isLI, findWrappingSuitableNodes, createElementsFromHTML, isVoidElement, tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { A } from '@ember/array';
import HTMLInputParser from '../../html-input-parser';
import { positionInRange } from '@lblod/marawa/range-helpers';

/**
 * Fake class to list helper functions
 * these functions can be used from the editor : editor.{function}
 *
 * UPDATE API
 *
 * @module contenteditable-editor
 * @class Update
 * @constructor
 */


/**
 * Alters a selection from the API described above.
 *
 * Any selected range can be manipulated.  This method allows such
 * changes to happen on following key terms: property, typeof,
 * dataType, resource, content, (TODO: attribute), innerContent,
 * innerHTML
 *
 * - selection: Object retrieved from #selectContext or
 *   #selectHighlight.
 * - options: Object specifying desired behaviour.
 * - options.remove: Removes RDFa content that was already there.
 *     Allows removing any of property, typeof, datatype, resource,
 *     content, (TODO: attribute), innerContent, innerHTML
 * - options.add: Adds specific content to the selection, pushing
 *     nvalues on top of already existing values.  Allows adding any
 *     of property, typeof, datatype, resource.  Set the
 *     forceNewContext property to true to force a new context if a
 *     full tag is selected.
 * - options.set: Allows setting any of property, typeof, datatype,
 *     resource content attribute innerContent innerHTML.  Set the
 *     newContext property to true to force a new context if a full
 *     tag is selected.
 * - options.desc: You are oncouraged to write a brief description
 *     of the desired manipulation here for debugging needs.
 *
 * The syntax for specifying items to remove works as follows:
 * - true: Removes any value to be removed.
 * - string: Removes the specific value as supplied.  If no value
 *   matches, nothing is removed.  For semantic content, translation
 *   is done based on the current context, eg: if there is a
 *   foaf:name in the document, then suppling the string
 *   "http://xmlns.com/foaf/0.1/name" will usually mean foaf:name is
 *   matched.
 * - [string]: An array of strings means all the matches will be
 *   removed.  Matching works the same way as string.
 * - regex: Considers the present value and executes a regular
 *   expression on said value.  If the regular expression matches,
 *   the value is removed.
 * - [regex]: An array of regular experssions.  If any matches, the
 *   value itself is matched.
 *
 * The syntax for specifying items to add works for all properties
 * which can be set using "add".  Specification works as follows:
 * - string: Specifies a single value to set or add.
 * - [string]: Specifies a series of values to set or add.
 *
 * NOTE: The system is free to set or add
 * properties based on a short form (derived from the prefixes
 * available in the context) if it is possible and if it desires to
 * do so.
 *
 * NOTE: newContext is set to undefined by default and behaves
 * similar to false.  This is because we assume that when you don't
 * care about the context there's a fair chance that we can merge
 * the contexts.  In specific cases you may desire to have things
 * merge (or not) explicitly.  You should set eithre true or false
 * in that case.
 *
 * NOTE/TODO: In order to make plugins simpler, we should look into
 * specifying namespaces in the plugin.  By sharing these namespaces
 * with these setter methods, it becomes shorter te specify the URLs
 * to match on.
 *
 * NOTE/TODO: It is our intention to allow for multiple operations
 * to occur in series.  Altering the range in multiple steps.  This
 * can currently be done by executing the alterSelection multiple
 * times.  Connecting the changes this way does require you to make
 * a new selection each time you want to execute a new change.  If
 * this case occurs often *and* we can find sensible defaults on
 * updating the selection, we could make this case simpler.  The
 * options hash would also allow an array in that case.
 *
 * @method update
 * @param {Selection} selection retuned by the selectContext method
 * @param {Options} options
 */
function update(selection, { remove, add, set, before, after, append, prepend, desc }) {
  const relativePosition = this.getRelativeCursorPosition();
  const currentNode = this.currentNode;

  updateDomNodes(selection, this.rootNode, { remove, add, set ,before, after, append, prepend, desc });
  updateEditorStateAfterUpdate.bind(this)(selection, relativePosition, currentNode);
  // TODO: should send out diff events when just the html has changed.
  // TODO: should probably only trigger diff events if all updates have been executed
  this.generateDiffEvents.perform([{source: "pernet"}]);
}

// HELPERS

/**
 * Verifies the specification and updates the dom nodes according to the specification
 *
 * @method updateDomNodes
 */
function updateDomNodes( selection, rootNode, { remove, add, set, before, after, append, prepend, desc } ) {
  if (selection.selections.length == 0)
    console.warn(`Received empty selection set on update. Nothing will be updated.`); // eslint-disable-line no-console

  verifySpecification({ remove, add, set ,before, after, append, prepend, desc });
  if(before || after || append || prepend){
    insertNodeOnSelection(rootNode, selection, { before, after, append, prepend });
  }
  else {
    updateNodeOnSelection(selection, rootNode, { remove, add, set, desc });
  }
}

/**
 * Helper update the editor state (positions, rich node of the selection) after an update.
 *
 * @param {Object} selection object to work on
 *
 * @method updateEditorStateAfterUpdate
 */
function updateEditorStateAfterUpdate(selection, relativePosition, currentNode) {
  // TODO: cursor handling is suboptimal, should be incorporated in update itself.
  // eg if we're clearing the node that contains our cursor, what would be a good strategy?
  this.updateRichNode();

  if (this.rootNode.contains(currentNode)) {
    const richNode = this.getRichNodeFor(this.currentNode);
    this.setCaret(richNode.domNode, Math.min(relativePosition, richNode.end));
  } else {
    this.set('currentNode', null);
    this.setCurrentPosition(this.currentPosition);
  }
}

// rdfa attributes we understand, currently ignoring src
const RDFAKeys = ['about', 'property', 'datatype', 'typeof', 'resource', 'rel', 'rev', 'content', 'vocab', 'prefix', 'href'];

// possible actions to take for an update
const WRAP = "wrap";
const UPDATE = "update";
const NEST = "nest";
const WRAPALL = "wrap-all"; // only sensible for contextSelection
const REPLACE = "replace"; // currently only makes sense for a selectedHighlightRange when providing set.innerHTML

/*** private HELPERS ***/

/**
 * Helper to organise selections (and underlying domNodes) so they can fit as a complete entity in the 'box' of the range.
 *
 * @param {Object} domNode of container editor
 * @param {Object} selection object to work on
 * @param {Object} { before, after, prepend, append } Options object, only one operation allowed
 *
 * @method insertNodeOnSelection
 * @private
 */
function insertNodeOnSelection(rootNode, selection, domPosition){
  if( (new Set(Object.values(domPosition))).delete(undefined).size > 1 ){
    console.warn('We currently support only one operation at the time. Returning'); // eslint-disable-line no-console
    return;
  }
  let { before, after, prepend, append } = domPosition;
  if(selection.selectedHighlightRange && (prepend || append)){
    console.warn('Currently we assume if highlight is selected, only textNodes will be selected. Prepend/Append not possible'); // eslint-disable-line no-console
    return;
  }

  // If a tag is specified we use it, otherwise we set <div> as default
  let tag = (before ? before.tag : false) ||  (after ? after.tag : false) || (prepend ? prepend.tag : false) || (append ? append.tag : false) || "div";
  const allowedTags = ["div", "p", "span", "li", "a", "link"];
  if(!allowedTags.includes(tag)){
    console.warn('We currently support only the following tags: "div", "p", "span", "li", "a", "link"'); // eslint-disable-line no-console
    return;
  }

  let selectionOfInterest = null;
  if(selection.selectedHighlightRange){
    let cleanedSelections = splitSelectionsToPotentiallyFitInRange(selection.selectedHighlightRange, selection.selections);
    if(before){
      //TODO: now only the first part of selection is taken blindly, but this should probably be smarter.
      selectionOfInterest = cleanedSelections.find(s => s.range[0] >= selection.selectedHighlightRange[0] );
    }
    else if(after){
      selectionOfInterest = cleanedSelections.find(s => selection.selectedHighlightRange[1] <= s.range[1]);
    }
  }
  //Assumes: a result from a selectContext, and will always contain tags
  //Assumes: if multiple selections are returned, probably the clients wants only to apply on the first one
  //         e.g. you probably don't want to insert a new resource or other identical information on two places.
  else {
    selectionOfInterest = selection.selections.find(s => !isVoidElement(s.richNode.domNode));
  }

  if(!selectionOfInterest) return;

  if (isRDFAUpdate({ before, after, prepend, append }) || isInnerContentUpdate({ before, after, prepend, append })) {
    let referenceNode = selectionOfInterest.richNode.domNode;
    let newDomNode = document.createElement(tag);

    if(isRDFAUpdate({ before, after, prepend, append }) && isInnerContentUpdate({ before, after, prepend, append })){
      updateRDFA([ newDomNode ], { set: (before || after || prepend || append) });
      updateInnerContent([ newDomNode ], { set: (before || after || prepend || append) });
      insertNodes(rootNode, referenceNode, [ newDomNode ], { before, after, prepend, append });
    }
    else if(isRDFAUpdate({ before, after, prepend, append })){
      updateRDFA([ newDomNode ], { set: (before || after || prepend || append) });
      insertNodes(rootNode, referenceNode, [ newDomNode ], { before, after, prepend, append });
    }
    else if(isInnerContentUpdate({ before, after, prepend, append })){
      updateInnerContent([ newDomNode ], { set: (before || after || prepend || append) });
      let childNodes = Array.from(newDomNode.childNodes);
      insertNodes(rootNode, referenceNode, childNodes, { before, after, prepend, append });
    }
  }
}

/**
 * Updates the nodes of a selection and their content according to the specification
 *
 * @method updateNodeOnSelection
 */
function updateNodeOnSelection(selection, rootNode, {remove, add, set, desc}) {
  const bestApproach = newContextHeuristic( selection, {remove, add, set, desc});
  let nodes = [];
  if ( bestApproach !== REPLACE && selection.selectedHighlightRange && isComplexSelection(selection)) {
    // TODO: find a sensible region to apply the update to
    console.warn('Handling of complex selection not yet implemented. Nothing will be updated at the moment.', selection); // eslint-disable-line no-console
  }

  if (bestApproach === WRAP) {
    nodes = wrapSelection(selection, {remove, add, set, desc});
  }
  else if (bestApproach === WRAPALL) {
    console.warn(`New context approach ${WRAPALL} is currently not supported.`); // eslint-disable-line no-console
  }
  else if (bestApproach === NEST) {
    nodes = nestSelection(selection);
  }
  else {
    nodes = selection.selections.map((sel) => sel.richNode.domNode );
  }
  if (bestApproach === REPLACE) {
    // NOTE: assumes selection is a highlight selection
    // NOTE: findWrappingSuitableNodes returns an array of objects with attributes {richNode, split}
    nodes = findWrappingSuitableNodes(selection);
    const bestNodes = nodes.filter(node =>  ! isAdjacentRange(node.range, selection.selectedHighlightRange));
    if (bestNodes.length > 0 ) {
      replaceNodesWithHtml(bestNodes, rootNode, selection.selectedHighlightRange, set);
    }
    else {
      // we only have adjacent nodes to work with
      replaceNodesWithHtml(nodes, rootNode, selection.selectedHighlightRange, set);
    }
  }
  else {
    if (isRDFAUpdate({remove,add,set})) {
      updateRDFA(nodes, {remove, add, set});
    }
    if (isInnerContentUpdate({remove,add,set})) {
      updateInnerContent(nodes, {remove, add, set});
    }
  }
}


/**
 * replacement of what was previously replaceTextWithHTML
 * this function tries to smartly insert the new HTML, so it doesn't break too much HTML
 */
function replaceNodesWithHtml(nodes, rootNode, [start, end], set) {
  let newElements;
  const cleanHTML = sanitizeHTML(set.innerHTML);
  if (set.tag) {
    const el = document.createElement(set.tag);
    el.innerHTML = cleanHTML;
    newElements = [el];
  }
  else {
    newElements = createElementsFromHTML(cleanHTML);
  }
  // what we will attempt here is to replace the most suitable node and just remove the others
  // initial version just replaces at first possible moment node and removes the others
  let insertedElements = false;
  for (let i=0; i<nodes.length; i++) {
    const node = nodes[i];
    const richNode = node.richNode;
    const domNode = richNode.domNode;
    if (!insertedElements) {
      if(!node.split) {
        if (rootNode == domNode || isLI(domNode) || hasRDFAKeys(domNode.attributes)) {
          // for the rootNode or a node with rdfa or list items don't actually replace but nest
          // (because that seems to be expected behaviour  ¯\_(ツ)_/¯ )
          while (domNode.firstChild) {
            domNode.removeChild(domNode.firstChild);
          }
          domNode.append(...newElements);
        }
        else {
          domNode.replaceWith(...newElements);
        }
        insertedElements = true;
      }
      else if ( richNode.type === "text") {
        if (richNode.start < start) {
          const prefixTextNode = document.createTextNode(domNode.textContent.slice(0, start - richNode.start));
          newElements.unshift(prefixTextNode);
        }
        if (richNode.end > end) {
          const postfixTextNode = document.createTextNode(domNode.textContent.slice(end - richNode.start));
          newElements.push(postfixTextNode);
        }
        domNode.replaceWith(...newElements);
        insertedElements = true;
      }
      else if ( i === nodes.length - 1) {
        // we're at the end and didn't encounter a splitable text or replacable node of type tag/other
        // this shouldn't happen, but if it does append after the node and log to console
        console.warn(`PERNET: received a non text node to split and replace, this shouldn't happen!`); // eslint-disable-line no-console
        domNode.replaceWith(node.richNode.domNode, ...newElements);
        insertedElements = true;
      }
      else {
        domNode.remove();
      }
    }
    else if(node.split && richNode.type ==="text") {
      // elements are already inserted, so we just have to cut off
      const replacements = [];
      if (richNode.start < start) {
        const prefixTextNode = document.createTextNode(domNode.textContent.slice(0, start - richNode.start));
        replacements.unshift(prefixTextNode);
      }
      if (richNode.end > end) {
        const postfixTextNode = document.createTextNode(domNode.textContent.slice(end - richNode.start));
        replacements.push(postfixTextNode);
      }
      domNode.replaceWith(...replacements);
    }
    else {
      domNode.remove();
    }
  }
}

/**
 * verifies if the inner content should be updated according to the provided specification
 * @method isInnerContentUpdate
 */
function isInnerContentUpdate({remove, set, before, after, append, prepend}) {
  // TODO: figure out what aad means with innerContent :)
  return ((remove && remove.innerHTML)
          || (set && set.innerHTML)
          || (before && before.innerHTML)
          || (after && after.innerHTML)
          || (append && append.innerHTML)
          || (prepend && prepend.innerHTML));
}

/**
 * updates the inner content of the provided nodes according to the specification
 * @method updateInnerContent
 */
function updateInnerContent(domNodes, {remove, set}) {
  for (let domNode of domNodes) {
    if (remove && remove.innerHTML) {
      domNode.innerHTML = '';
    }
    if (operationWantsToSetInnerHTML(set)) {
      domNode.innerHTML = sanitizeHTML(set.innerHTML);
    }
  }
}

/**
 * Sanitizes the html before inserting it
 * @method sanitizeHTML
 */
function sanitizeHTML(html) {
  const safeAttributes = HTMLInputParser.DEFAULTS.safeAttributes.concat(['class','id']);
  const inputParser = new HTMLInputParser({lumpTags: [], safeAttributes});
  const cleanHTML = inputParser.cleanupHTML(html);
  return cleanHTML;
}

function insertNodes(rootNode, referenceNode, newNodes, { before, after, prepend, append }){
  let parent = referenceNode.parentNode;
  if(!rootNode.contains(parent)){
    console.warn('Reference node is not contained by parent. Skipping'); // eslint-disable-line no-console
    return;
  }
  let baseNode = referenceNode;
  if(before || after){
    for(let newDomNode of before ? newNodes.reverse() : newNodes ){
      if(before){
        parent.insertBefore(newDomNode, baseNode);
      }
      else if(after){
        parent.insertBefore(newDomNode, baseNode.nextSibling); //TODO: do I need to make sure nextSibling makes sense (e.g what if you have commentNode)
      }
      baseNode = newDomNode;
    }
  }
  else if(prepend || append){
    if(prepend) referenceNode.prepend(...newNodes);
    if(append) referenceNode.append(...newNodes);
  }
}

/**
 * does this operation
 * @method operationWantsToSetInnerHTML
 * @private
 */
function operationWantsToSetInnerHTML(set) {
  // also support empty strings for innerHTML (empty string is falsy in JS)
  return (set && (typeof set.innerHTML == "string" || set.innerHTML));
}

/**
 * heuristic to determine whether we should wrap, nest or update the current selection
 * @method newContextHeuristic
 * @private
 */
function newContextHeuristic( selection, {remove, add, set}) {
  if (selection.selectedHighlightRange) {
    if (operationWantsToSetInnerHTML(set)) {
      return REPLACE;
    }
    else {
      // default to wrap a text selection for now
      // this could be overwritten in a smarter nodesToWrap method
      return WRAP;
    }
  }
  else {
    // it's a context selection take into account existing RDFA if possible
    if (remove) {
      return UPDATE;
    }
    else if (add) {
      if (selection.selections.length > 1) {
        if (add.forceNewContext && (add.forceNewContext === WRAP || add.forceNewContext === NEST)) {
          return add.forceNewContext;
        }
        else {
          // assume nesting for context selections with more than 1 element if unspecified
          return NEST;
        }
      }
      else if (selection.selections.length === 1) {
        if (add.forceNewContext) {
          if ([WRAP,WRAPALL, NEST].includes(add.forceNewContext)) {
            return add.forceNewContext;
          }
          else {
            return wrapOrNest(selection.selections[0].richNode, add);
          }
        }
        else {
          return UPDATE;
        }
      }
      else {
        return null; // don't do anything on empty selections?
      }
    }
    else if (set) {
      return UPDATE;
    }
    else {
      console.warn("You must specify either 'add', 'remove' or 'set' on an update operation"); // eslint-disable-line no-console
      return null;
    }
  }
}

function wrapOrNest(node, specification) {
  /*
   * - about – a URI or CURIE specifying the resource the metadata is about
   * - rel and rev – specifying a relationship and reverse-relationship with another resource, respectively
   * - resource – specifying the partner resource (currently ignoring src and href)
   * - property – specifying a property for the content of an element or the partner resource
   * - content – optional attribute that overrides the content of the element when using the property attribute
   * - datatype – optional attribute that specifies the datatype of text specified for use with the property attribute
   * - typeof – optional attribute that specifies the RDF type(s) of the subject or the partner resource (the resource that the metadata is about).
   */

  const domNode = node.domNode;
  if (domNode.hasAttribute('property') && !(domNode.hasAttribute('content') || domNode.hasAttribute('datatype')) ) {
    // current domnode specifies a property
    if (specification.about) {
      // describing a new resource, likely nesting below a property?
      return NEST;
    }
    else // TODO define extra rules
      return WRAP;
  }
  else if (domNode.hasAttribute('content') || domNode.hasAttribute('datatype')) {
    return null; // current domnode specifies a triple with a literal
  }
  else {
    // fallback to WRAP
    return WRAP;
  }
}

/**
 *
 * @method nestSelection
 * @private
 */
function nestSelection( selection ) {
  const nodes = [];
  for (let node of selection.selections.map((el) => el.richNode)) {
    if (node.type !== 'tag') {
      console.warn('Cannot nest under node of type ' + node.type); // eslint-disable-line no-console
    }
    else {
      const newElement = document.createElement('span'); // prefer spans for nesting TODO: configurable
      node.domNode.prepend(newElement);
      while(newElement.nextSibling) {
        let sibling = newElement.nextSibling;
        newElement.append(sibling);
      }
      nodes.push(newElement);
    }
  }
  return nodes;
}
/**
 * returns intersection of 2 arrays.
 * @method intersection
 * @private
 */
function intersection(arr1, arr2) {
  return arr1.filter(function(value) {
    return arr2.indexOf(value) > -1;
  });
}

/**
 * verifies if rdfa keys are set on the provided object
 * @method hasRDFAKeys
 * @private
 */
function hasRDFAKeys(object) {
  if (object) {
    const inter = intersection(RDFAKeys, Object.keys(object));
    return inter.length > 0;
  }
  else
    return false;
}

/**
 * verifies if the provided update tries to update RDFA attributes
 * @method isRDFAUpdate
 * @private
 */
function isRDFAUpdate(specification) {
  // note we currently don't expand specification, and loop over the keys for ease of use.
  // this seemed more readible versus a big list of ors and seemed safer:
  // writting like this no key can be forgotten in the list
  const rdfaUpdates = Object.keys(specification).filter((key) => hasRDFAKeys(specification[key]));
  if (rdfaUpdates.length > 0)
    return true;
  else
    return false;
}

/**
 *  will update a dom attribute, either removing a value from the space separated list or unsetting it
 * @method removeDOMAttributeValue
 * @private
 */
function removeDOMAttributeValue(domNode, attribute, value) {
  if (domNode.hasAttribute(attribute)) {
    const previousValue = domNode.getAttribute(attribute);
    const currentValues = (previousValue || "").split(" ").reject((s) => s.length === 0);
    const valuesToDelete = value instanceof Array ? value : [value];
    const newValues = currentValues.filter(x => !valuesToDelete.includes(x));
    const dedupValues = [...new Set(newValues)]; // Array dedup
    if (dedupValues.length === 0)
      domNode.removeAttribute(attribute);
    else
      domNode.setAttribute(attribute, dedupValues.join(" "));
  }
}

/**
 * updates a dom attribute either adding a value to the space separated list or setting it, avoids doubles
 * @method addDomAttributeValue
 * @private
 */
function addDomAttributeValue(domNode, attribute, value) {
  if (domNode.hasAttribute(attribute)) {
    const previousValue = domNode.getAttribute(attribute);

    if (attribute == 'prefix') {
      let updatedPrefix = mergePrefixValue(previousValue, value);
      domNode.setAttribute(attribute, updatedPrefix);
    }

    else {
      const currentValues = (previousValue || "").split(" ").reject((s) => s.length === 0);
      const newValues = value instanceof Array ? value : [value];
      const dedupValues = [...new Set([...currentValues, ...newValues])]; // Array join and dedup
      domNode.setAttribute(attribute, dedupValues.join(" "));
    }
  }
  else {
    setDomAttributeValue(domNode, attribute, value);
  }
}

function setDomAttributeValue(domNode, attribute, value) {
  if (!(attribute == "tag")) { // tag is an option of the update but not an attribute
    if (value instanceof Array) {
      value = value.join(" "); // Supports multiple values (ex. typeof)
    }
    domNode.setAttribute(attribute, value);
  }
}

function mergePrefixValue(previousValue, newValue){
  let previousPrefixes = parsePrefixString(previousValue);
  let newPrefixes = parsePrefixString(newValue);

  let updatedPrefixes = Object.keys(newPrefixes).reduce((acc, key) => {
    acc[key] = newPrefixes[key];
    return acc;
  }, previousPrefixes);

  updatedPrefixes = cleanPrefixObject(updatedPrefixes);

  return Object.keys(updatedPrefixes).map(k => `${k}: ${updatedPrefixes[k]}`).join(' ');
}

function cleanPrefixObject(prefixes){
  delete prefixes[""];
  return Object.keys(prefixes).reduce((acc, k) => {
    if(prefixes[k]) acc[k] = prefixes[k];
    return acc;
  }, {});
}
/**
 * creates a wrapper element around the selection, currently always a div (newContext)
 * @method wrapSelection
 * @private
 */
function wrapSelection(selection, {remove, add, set, desc}) {
  // If a tag is specified we use it, otherwise we set <div> as default
  let tag = (remove ? remove.tag : false) ||  (add ? add.tag : false) || (set ? set.tag : false) || (desc ? desc.tag : false) || "div";
  const allowedTags = ["div", "p", "span", "li", "a", "link"];
  if(!allowedTags.includes(tag)) {
    console.warn('We currently support only the following tags: "div", "p", "span", "li", "a", "link"'); // eslint-disable-line no-console
    return;
  }

  if (selection.selectedHighlightRange) {

    const selections = splitSelectionsToPotentiallyFitInRange(selection.selectedHighlightRange, selection.selections);
    const newContext = document.createElement(tag);
    // find the actual nodes to move, these might be higher up in the tree.
    // can assume the nodes in selections can be completely wrapped
    // (prefix and postfix is taken care of above this comment)
    const nodesToWrap = findNodesToWrap(selections.map((sel) => sel.richNode), selection.selectedHighlightRange);
    nodesToWrap[0].domNode.before(newContext);
    // move selected nodes to new context
    for (const node of nodesToWrap) {
      newContext.appendChild(node.domNode);
    }
    // TODO: should also update rich node correctly, brain currently broken on what nodes to wrap returns, but they should all have the same parent right? if not the above move is not correct :D
    return [newContext];
  }
  else {
    // it's a contextSelection
    const nodes = selection.selections.map((element) => element.richNode);
    const newContexts = [];
    // currently just wrapping each element separately, context selections don't have to be consecutive
    for (let richNode of nodes) {
      const newContext = document.createElement('div');
      const domNode = richNode.domNode;
      domNode.replaceWith(newContext);
      newContext.appendChild(domNode);
      wrapRichNode(richNode, newContext);
      newContexts.push(newContext);
    }
    return newContexts;
  }
}

/**
 * walks up the tree to include parents if possible
 * assumes all provided nodes can be wrapped completely
 * assumes a consecutive selection, no gaps
 * returns a list of richnodes matching the range
 * @method findNodesToWrap
 * @private
 */
function findNodesToWrap(richNodes, [start, end] ) {
  const nodesToWrap = [];
  for (let node of richNodes) {
    let current = node;
    // walk up the three as long as we fit within the range
    while (current.parent && current.parent.start >= start && current.parent.end <= end) {
      // this assumes the richnode tree never includes the editor element itself!
      current = current.parent;
    }
    if (!nodesToWrap.includes(current) && current.start >= start && current.end <= end) {
      nodesToWrap.push(current);
    }
  }
  return nodesToWrap;
}

/**
 * Helper to organise selections (and underlying domNodes) so they can fit as a complete entity in the 'box' of the range.
 *
 * The bulk of the complexity is organising and splitting the domNodes:
 * Suppose the text below consists of two textnodes(separated by '_') and the '{}' represents the range.
 *       TEXT{NODE_OTHER}TEXTNODE
 * It wil then make sure the domNodes will look like:
 *       TEXT_{NODE_OTHER}_TEXTNODE
 * TODO
 * ----
 * - works only for textnodes
 * - this function needs further splitting.
 * @param {Array} [ start, end ]
 * @param {Array} [ selection, ..., selection ]
 * @return {Array} [ selection, ..., selection ]
 * @method splitSelectionsToPotentiallyFitInRange
 * @private
 */
function splitSelectionsToPotentiallyFitInRange([start, end], providedSelections){
  const actualSelections = A();
  for (let selection of providedSelections) {
    const richNode = selection.richNode;
    if (selection.richNode.type == "text") {
      if ( positionInRange(start, richNode.region) || positionInRange(end, richNode.region)) {
        // selection region partially overlaps or is wholy contained in richNode, so should split the node
        let prefix, infix, postfix;
        if (selection.richNode.start < start) {
          [ prefix, infix ] = splitRichTextNode(richNode, start);
        }
        if (selection.richNode.end > end) {
          if (infix) {
            [infix, postfix] = splitRichTextNode(infix, end);
          }
          else {
            [infix, postfix] = splitRichTextNode(richNode, end);
          }
        }
        // apply change to dom tree
        const newRichNodes = [prefix, infix, postfix].filter((x) => !!x);
        if (newRichNodes.length > 0 ) {
          replaceRichNodeWith(richNode, newRichNodes);
          // TODO: should this be done by replaceRichNodeWith ?
          const newDomNodes = newRichNodes.map( (node) => node.domNode);
          richNode.domNode.replaceWith(...newDomNodes);
          for (let newRichNode of newRichNodes) {
            actualSelections.push({range: newRichNode.region, richNode: newRichNode});
          }
        }
        else {
          console.warn('no new richnodes'); // eslint-disable-line no-console
          actualSelections.push(selection);
        }
      }
      else {
        actualSelections.push(selection);
      }
    }
    else {
      console.debug("not splitting selection",selection); // eslint-disable-line no-console
      actualSelections.push(selection);
    }
  }
  return actualSelections;
}

/**
 * verifies if the provided selection is a selection we support
 * @method isComplexSelection
 * @private
 */
function isComplexSelection(selection) {
  // an unsupported complex selection is a selection that spans multiple nodes
  // the nodes don't all have the same parent
  // and not all children of the different parents are selected
  // but does not cover them completely
  // e.g     a
  //      /     \
  //     b       c
  //   /  \     / \
  // t1   t2   t3  t4
  // where t2, t3 and t4 are selected

  if (selection.selections.length == 1) {
    return false;
  } else if (selection.selectedHighlightRange && isEmptyRange(selection.selectedHighlightRange)) {
    return false;
  } else {
    const verifyParents = function(parents, children) {
      const cleanedParents = (Array.from(parents)).filter((element) => element); // remove null values
      if (cleanedParents.length === 1)
        return false;
      else if (cleanedParents.length === 0) {
        console.warn('Complex selection detected: no common parent found. Selections belong to different ancestor nodes.'); // eslint-disable-line no-console
        return true;
      }
      else {
        for (let parent of cleanedParents) {
          for (let child of parent.children) {
            if (! children.includes(child) ) {
              console.warn('Complex selection detected: not all children of a parent are included.', selection); // eslint-disable-line no-console
              return true;
            }
          }
        }
        const newParents = cleanedParents.map((element) => element.parent);
        return verifyParents(newParents, cleanedParents);
      }
    };

    // don't take empty selections at the boundary of the selected range into account to determine the complexity of the selection
    let selections = [];
    if (selection.selectedHighlightRange) {
      selections = selection.selections.filter( function(sel) {
        return !isEmptyRange(sel.range) || !isAdjacentRange(sel.range, selection.selectedHighlightRange);
      });
    } else {
      selections = selection.selections;
    }

    const directParents = new Set();
    for (let sel of selections) {
      directParents.add(sel.richNode.parent);
    }
    const children = selections.map( (sel) => sel.richNode);
    return verifyParents(directParents, children);
  }
}

/**
 * converts an update specification to an array of values that can be removed/added
 * @method selectedAttributeValues
 * @private
 */
function selectedAttributeValues(domNode, attribute, specification) {
  if (specification instanceof String || typeof(specification) == "string") {
    return [specification];
  }
  else if (specification instanceof RegExp) {
    return [...domNode.getAttribute(attribute).matchAll(specification)];
  }
  else if (specification instanceof Array) {
    const matches = specification.map((spec) => {
      if (spec instanceof RegExp)
        return [...domNode.getAttribute(attribute).matchAll(spec)];
      else if (spec instanceof String || typeof(spec) == "string")
        return [spec];
      else
        return [];
    });
    return Array.prototype.concat.apply([], matches); // flattens array
  }
  else {
    throw new Error(`Unsupported specification for attribute ${attribute} with value ${specification}.`);
  }
}

/**
 * Alters the RDFA properties of a selection
 * Currently supports the following RDFA properties/combinations
 * - about – a URI or CURIE specifying the resource the metadata is about
 * - rel and rev – specifying a relationship and reverse-relationship with another resource, respectively
 * - resource – specifying the partner resource (currently ignoring src and href)
 * - property – specifying a property for the content of an element or the partner resource
 * - content – optional attribute that overrides the content of the element when using the property attribute
 * - datatype – optional attribute that specifies the datatype of text specified for use with the property attribute
 * - typeof – optional attribute that specifies the RDF type(s) of the subject or the partner resource (the resource that the metadata is about).
 * - href – attribute that can only be applied to <a> or <link> tags
 * - href and resource – the href property is not required if a resource is
 *    defined. If both are defined, the most recently added will be used.
 *    If both are defined at the same time, both will be applied but the resource
 *    is the one that will be linked to the property according to the rdfa standards.
 * @method updateRDFA
 * @private
 */
function updateRDFA(domNodes, { remove, add, set } ) {
  for (let domNode of domNodes) {
    for (let attribute of RDFAKeys) {
      if (remove && remove[attribute]) {
        if (remove[attribute] === true) {
          domNode.removeAttribute(attribute);
        }
        else {
          for (let value of selectedAttributeValues(domNode, attribute, remove[attribute])) {
            removeDOMAttributeValue(domNode, attribute, value);
          }
        }
      }
      if ((set && set[attribute]) || (add && add[attribute])) {
        const tagIsHrefCompatible = tagName(domNode) === "a" || tagName(domNode) == "link";
        const nodeHasResourceOrHref = domNode.hasAttribute("resource") || domNode.hasAttribute("href");
        const optionHasResourceOrHref = (set && (set["href"] || set["resource"])) || (add && (add["href"] || add["resource"]));

        if (tagIsHrefCompatible && !(nodeHasResourceOrHref || optionHasResourceOrHref)) {
          console.warn(`<${domNode.tagName}> tag should have a resource or a href.`); // eslint-disable-line no-console
          return true;
        }

        // If the node previously had a resource and the user wants to set an href, resource gets replaced by href
        if (attribute == "href" && tagIsHrefCompatible && domNode.hasAttribute("resource")) {
          domNode.removeAttribute("resource");
        }

        if (set && set[attribute]) {
          const value = set[attribute];
          setDomAttributeValue(domNode, attribute, value);
        }
        else if (add && add[attribute]) {
          const values = add[attribute] instanceof Array ? add[attribute] : [add[attribute]];
          for (let value of values) {
            addDomAttributeValue(domNode, attribute, value);
          }
        }
      }
    }
  }
}

function verifySpecification({ add, desc }) {
  runInDebug( () => {
    if (desc)
      console.info(`running update: ${desc}`); // eslint-disable-line no-console
    if (add) {
      if (add.content)
        console.warn('adding content is not supported, use set'); // eslint-disable-line no-console
      if (add.datatype)
        console.warn('adding datatype is not supported, use set'); // eslint-disable-line no-console
      if (add.innerHTML)
        console.warn('adding innerHTML is not supported, use set'); // eslint-disable-line no-console
    }
  });
}

export { update };
