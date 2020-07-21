import { debug, warn } from '@ember/debug';
import flatMap from './flat-map';
import {
  tagName,
  removeNodeFromTree as unwrapDOMNode,
  findWrappingSuitableNodes
} from './dom-helpers';
import ReplaceWithPolyfill from 'mdn-polyfills/Node.prototype.replaceWith';
import RichNode from '@lblod/marawa/rich-node';
import { isAdjacentRange } from '@lblod/marawa/range-helpers';
import { DEFAULT_TAG_NAME } from './editor-property';
import {
  replaceRichNodeWith,
  unwrapRichNode,
} from './rich-node-tree-modification';

const IGNORABLE_ATTRIBUTES=["data-editor-position-level", "data-editor-rdfa-position-level"];

// TODO: find a clean spot for this polyfill
if (!Element.prototype.replaceWith)
  Element.prototype.replaceWith = ReplaceWithPolyfill;
if (!CharacterData.prototype.replaceWith)
  CharacterData.prototype.replaceWith = ReplaceWithPolyfill;
if (!DocumentType.prototype.replaceWith)
  DocumentType.prototype.replaceWith = ReplaceWithPolyfill;

/**
 * so how does this work?
 *
 * you can apply or cancel a property on a selection, created with editor.selectHighlight
 * NOTE: support for selections based on editor.selectContext and (tbd) editor.selectCursorPosition needs to be added.
 * both apply and cancel will call findWrappingSuitableNodes on the selection to walk up the tree and find a set of suitable nodes to work on.
 * The current implementation of suitable nodes walks up as long as the range of the parentNode fits within the selected range
 * (e.g. if a sibling text node of a block is included it might walk up to the block and text node's parent)
 *
 * cancel will recursively cancel downwards, starting on the suitable nodes. if an edge node needs to be split, it will first cancel on the entire node and then call apply on the split of range.
 * applying needs to be smarter and depends on an attribute (newContext) and function (permittedContent) of the property.
 * 1. it will first call cancel on the suitable nodes, in an effort to clean up the tree and avoid double application of a property
 * 2. it calls property.permittedContent on each the suitable nodes
 * 3. for each of the permitted nodes it tries to apply the property
 * 4a. if property.newContext is truthy it will create a wrapper around the permitted node
 * 4b. if property.newContext is false it will only create a wrapper if the permitted node is not a tag or the tagname doesn't match or property.tagName is set and doesn't match the tagname of the node.
 */

/**
 * verifies if a property is enabled on all leaf nodes of the supplied richNode
 * @method propertyIsEnabledOnLeafNodes
 * @return boolean
 * @for PropertyHelpers
 * @private
 */
function propertyIsEnabledOnLeafNodes(richnode, property) {
  const hasChildren = node => { return ( node && ((! node.children) ||  node.children.length === 0));};
  const leafNodes = flatMap(richnode, hasChildren);
  const leafNodesWhereStyleIsNotAppliedExists =  leafNodes.some((n) => n.type !== "other" && !property.enabledAt(n)) ;
  return ! leafNodesWhereStyleIsNotAppliedExists;
}

/**
 * apply a property to an existing dom node
 *
 * @method rawApplyProperty
 * @param DOMElement domNode
 * @param EditorProperty property
 */
function rawApplyProperty(domNode, property) {
  for (let attribute of Object.keys(property.attributes)) {
    if(domNode.hasAttribute(attribute)) {
      const previousValue = domNode.getAttribute(attribute);
      domNode.setAttribute(attribute, `${previousValue} ${property.attributes[attribute]}`);
    }
    else {
      domNode.setAttribute(attribute, property.attributes[attribute]);
    }
  }
}

/**
 * creates a new DOMElement in line with the property specification
 * @method createWrapperForProperty
 * @param EditorProperty property
 */
function createWrapperForProperty(property) {
  const tagName = property.tagName ? property.tagName : DEFAULT_TAG_NAME;
  const tag = document.createElement(tagName);
  for (let attribute of Object.keys(property.attributes)) {
    tag.setAttribute(attribute, property.attributes[attribute]);
  }
  return tag;
}


/**
 * apply a property to a selection
 * @method applyProperty
 * @param selection
 * @param document, should provide a pernet api
 * @param property an editor property
 * @for PropertyHelpers
 */
function applyProperty(selection, doc, property, calledFromCancel) {
  if (selection.selections.length === 0) {
    warn(`can't apply property to empty selection`, {id: 'content-editable.editor-property'});
    return;
  }
  if (!calledFromCancel) {
    // cancel first to avoid duplicate tags
    cancelProperty(selection, doc, property);
  }

  // TODO: This is probably not the way to go about it, but it addresses the current problem.
  selection = doc.selectHighlight(selection.selectedHighlightRange);

  let startingNodes = findWrappingSuitableNodes(selection);
  if (selection.selectedHighlightRange) {
    startingNodes = startingNodes.filter(node => {
      return !(isAdjacentRange(node.range, selection.selectedHighlightRange) && node.split);
    });
  }
  for( let {richNode, range} of startingNodes ) {
    const [start,end] = range;
    if (richNode.type ===  "tag" && (richNode.start < start || richNode.end > end)) {
        warn(`applyProperty does not support applying a property to a tag that only partially matches the range`, {id: "content-editable.highlight"});
    }
    else {
      for (const permittedNode of property.permittedContent(richNode)) {
        const nodeStart = Math.max(permittedNode.start, start);
        const nodeEnd = Math.min(permittedNode.end, end);
        applyPropertyOnNode(property, permittedNode, [nodeStart, nodeEnd]);
      }
    }
  }
}

function applyPropertyOnNode(property, richNode, [start,end]) {
  try {
    if (richNode.type === "tag") {
      const domNode = richNode.domNode;
      let wrappingDomNode;
      if (property.newContext) {
        const parentNode = domNode.parentNode;
        wrappingDomNode = createWrapperForProperty(property);
        parentNode.replaceChild(wrappingDomNode, domNode);
        wrappingDomNode.append(domNode);
        const richNodeForWrapper = new RichNode({
          domNode: wrappingDomNode,
          parent: richNode.parent,
          children: [richNode],
          start: richNode.start,
          end: richNode.end,
          type: "tag"
        });
        replaceRichNodeWith(richNode, [richNodeForWrapper]);
      }
      else {
        rawApplyProperty(richNode.domNode, property);
      }
    }
    else if (richNode.type === "text") {
      const relativeStart = Math.max(start - richNode.start, 0);
      const relativeEnd = Math.min(end - richNode.start, richNode.text.length);
      const [preText, infixText, postText] =
            [ richNode.text.slice( 0, relativeStart ),
              richNode.text.slice( relativeStart, relativeEnd ),
              richNode.text.slice( relativeEnd ) ];
      const prefixNode = preText == "" ? null : document.createTextNode( preText );
      const infixNode = createWrapperForProperty(property);
      const infixTextNode = document.createTextNode( infixText );
      infixNode.appendChild( infixTextNode );
      const postfixNode = postText == "" ? null : document.createTextNode( postText );
      const newDomNodes = [prefixNode,infixNode,postfixNode].filter( (x) => x );
      // update the DOM tree
      richNode.domNode.replaceWith( ...newDomNodes);
      const preRichNode = ! prefixNode ? null : new RichNode({
        domNode: prefixNode,
        parent: richNode.parent,
        start: richNode.start,
        end: start,
        text: preText,
        type: "text"
    });
      const infixRichNode = ! infixNode ? null : new RichNode({
        domNode: infixNode,
        parent: richNode.parent,
        start,
        end,
        text: infixText,
        type: "tag"
      });
      infixRichNode.children = [ new RichNode({
      domNode: infixTextNode,
        parent: infixRichNode,
        start,
        end,
        text: infixText, // TODO: remove if consuming code doesn't use the TextNodeWalker
        type: "text"
      }) ];
      const postfixRichNode = ! postfixNode ? null : new RichNode({
        domNode: postfixNode,
        parent: richNode.parent,
        start: end,
        end: end + postText.length,
        text: postText,
        type: "text"
    });
      const newRichNodes = [];
      if( preRichNode ) { newRichNodes.push( preRichNode ); }
      newRichNodes.push( infixRichNode );
      if( postfixRichNode ) { newRichNodes.push( postfixRichNode ); }
      replaceRichNodeWith(richNode, newRichNodes);
    }
  }
  catch(e) {
    console.warn(e); // eslint-disable-line no-console
  }
}

/**
 * remove a property from a richNode
 */
function rawCancelProperty(richNode, property) {
  if (richNode.type === 'tag') {
    if (domNodeIsEqualToProperty(richNode.domNode,property)) {
      // dom node matches the property completely, no extra info set
      unwrapDOMNode(richNode.domNode);
      unwrapRichNode(richNode);
    }
    else if (domNodeContainsProperty(richNode.domNode, property)) {
      // dom node has the correct tag and attributes, but has more information
      // only remove property related information
      for (let key of Object.keys(property.attributes)) {
        // clean up attributes
        // TODO: if an attribute is multivalue (e.g space separated) this assumes attribute order from the property is maintained
        const oldValue = richNode.domNode.getAttribute(key);
        const updatedValue = oldValue.replace(property.attributes[key], '');
        if (updatedValue.length === 0)
          richNode.domNode.removeAttribute(key);
        else
          richNode.domNode.setAttribute(key, updatedValue);
      }
      if (tagName(richNode.domNode) === property.tagName) {
        // change the tagname to a neutral tag name, assumes tagname of property has semantic or graphical meaning
        // this can't be done dynamically so we have to create new node and replace the previous one
        const newNode = document.createElement(DEFAULT_TAG_NAME); // TODO have to pick a default, is this sane?
        for(let a of richNode.domNode.attributes) {
          newNode.setAttribute(a.nodeName, a.nodeValue);
        }
        while (richNode.domNode.firstChild) {
          newNode.appendChild(richNode.domNode.firstChild);
        }
        richNode.domNode.replaceWith(newNode);
        richNode.domNode = newNode;
      }
    }
    if (richNode.children && richNode.children.length > 0) {
      // walk down, make sure property is also cancelled on children.
      // gets rid of nested tags e.g. <strong><strong></strong></strong>
      for (let child of richNode.children) {
        if (child.type === 'tag')
          rawCancelProperty(child, property);
      }
    }
  }
  else {
    // can only cancel on a tag, do nothing
  }
}

/*
 * predicate to evaluate if a property completely matches a dom node
 */
function domNodeIsEqualToProperty(domNode, property) {
  let attributesMatch = true;
  for (let key of Object.keys(property.attributes)) {
    if (!domNode.hasAttribute(key) || domNode.getAttribute(key) !== new String(property.attributes[key]).toString()) {
      attributesMatch = false;
    }
  }

  for (let attribute of domNode.attributes) {
    if (! IGNORABLE_ATTRIBUTES.includes(attribute.nodeName) && !property.attributes[attribute.nodeName]) {
      attributesMatch = false;
    }
  }
  const propertyTagName = property.tagName ? property.tagName : DEFAULT_TAG_NAME;
  return propertyTagName === tagName(domNode) && attributesMatch;
}

/*
 * predicate to evaluate if a property matches a dom node, other attributes can be present on the dom node
 */
function domNodeContainsProperty(domNode, property) {
  let attributesMatch = true;
  for (let key of Object.keys(property.attributes)) {
    if (!domNode.hasAttribute(key) || ! domNode.getAttribute(key).includes(property.attributes[key]))
      attributesMatch = false;
  }
  return (! property.tagName || property.tagName === tagName(domNode)) && attributesMatch;
}


/**
 * cancel a property on a selection
 * @method cancelProperty
 * @param selection
 * @param document, should provide a pernet api
 * @param property an editor property
 * @for PropertyHelpers
 */
function cancelProperty(selection, doc, property) {
  if (selection.selections.length === 0) {
    warn(`can't cancel property on empty selection`, {id: 'content-editable.editor-property'});
    return;
  }
  const nodesToCancelPropertyOn = findWrappingSuitableNodes(selection);
  for( let {richNode, range} of nodesToCancelPropertyOn) {
    const [start,end] = range;
    if (richNode.type ===  "tag") {
      if (richNode.start < start || richNode.end > end) {
        warn(`cancelProperty does not support cancelling a property to a tag that only partially matches the range`, {id: "content-editable.editor-property"} );
      }
      else {
        rawCancelProperty(richNode, property);
      }
    }
    else if (richNode.type === "text") {
      // we should cancel the property on part of the string, we need to find a parent that is setting the property and cancel that
      // then reapply the property to the pre and post fix nodes
      let currentNode = richNode.parent;
      while(currentNode.parent && !domNodeContainsProperty(currentNode.domNode, property)) {
        currentNode = currentNode.parent;
      }
      if (domNodeContainsProperty(currentNode.domNode,property)) {
        rawCancelProperty(currentNode, property);
        if (currentNode.start < start) {
          // reapply property on prefix
          const sel = doc.selectHighlight([currentNode.start, start]);
          applyProperty(sel, doc, property, true);
        }
        if (currentNode.end > end) {
          // reapply property on postfix
          const sel = doc.selectHighlight([ end, currentNode.end]);
          applyProperty(sel, doc, property, true);
        }
      }
      else if (propertyIsEnabledOnLeafNodes(currentNode, property)) {
        // we didn't find where the property was applied, it could be that this property was enabled in a manner we don't yet understand
        // probably need a cancelling wrapper
        // TODO
        warn(`did not find node that enabled property`, {id: 'contenteditable.property'});
      }
      else {
        // property doesn't seem to be enabled at all
        debug(`request to cancel a property, but it wasn't enabled`);
      }
    }
    else {
      debug( "cancelling a property can only occur on text nodes or on tag nodes");
    }
  }
}


export { cancelProperty, applyProperty };
