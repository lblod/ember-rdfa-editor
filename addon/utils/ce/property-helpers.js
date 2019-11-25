import { warn } from '@ember/debug';
import flatMap from './flat-map';
import {
  tagName,
  removeNodeFromTree as unwrapDOMNode
} from './dom-helpers';
import ReplaceWithPolyfill from 'mdn-polyfills/Node.prototype.replaceWith';
import RichNode from '@lblod/marawa/rich-node';
import { isAdjacentRange, isEmptyRange } from '@lblod/marawa/range-helpers';
import { DEFAULT_TAG_NAME } from './editor-property';
import {
  replaceRichNodeWith,
  wrapRichNode,
  unwrapRichNode
} from './rich-node-tree-modification';

// TODO: find a clean spot for this polyfill
if (!Element.prototype.replaceWith)
  Element.prototype.replaceWith = ReplaceWithPolyfill;
if (!CharacterData.prototype.replaceWith)
  CharacterData.prototype.replaceWith = ReplaceWithPolyfill;
if (!DocumentType.prototype.replaceWith)
  DocumentType.prototype.replaceWith = ReplaceWithPolyfill;

/**
 * verifies if a property is enabled on all leaf nodes of the supplied richNode
 * @method propertyIsEnabledOnLeafNodes
 * @return boolean
 * @for PropertyHelpers
 * @private
 */
function propertyIsEnabledOnLeafNodes(richnode, property) {
  const hasChildren = child => { return ( child && ((! child.children) ||  child.children.length === 0))};
  const leafNodes = flatMap(richnode, hasChildren);
  const leafNodesWhereStyleIsNotAppliedExists =  leafNodes.some((n) => n.type !== "other" && !property.enabledAt(n)) ;
  return ! leafNodesWhereStyleIsNotAppliedExists;
}


/**
 * We need to apply or remove a property to all portions of text based on the output
 * contained in them.  We can split the important nodes in three
 * pieces:
 *
 * - start: text nodes which contain partial content to highlight
 * - middle: rich nodes which are the highest parent of a text node that are still contained in the selected range
 * - end: trailing text nodes which contain partial content to highlight
 *
 * Detecting this range is tricky
 *
 * @method findSuitableNodesToApplyOrCancelProperty
 * @param Selection selection
 * @for PropertyHelpers
 * @return Array array of selections
 */
function findSuitableNodesToApplyOrCancelProperty(selection) {
  if (!selection.selectedHighlightRange) {
    // TODO: support context selections as well
    // this might be fairly trivial but focussing on text selection for now
    throw new Error('currently only selectedHighlightRange is supported');
  }
  const nodes = [];
  const domNodes = [];
  const [start, end] = selection.selectedHighlightRange;
  for (let {richNode, range} of selection.selections) {
    if (richNode.start < start || richNode.end > end) {
      // this node only partially matches the selected range
      // so it needs to be split up later and we can't walk up the tree.
      if (!domNodes.includes(richNode.domNode)) {
        nodes.push({richNode, range, split:true});
        domNodes.push(richNode.domNode);
      }
    }
    else {
      // walk up the tree as longs as we fit within the range and don't encounter a block or list item
      let current = richNode;
      const isBlock = function(node) {
        if (node.type !== "tag")
          return false;
        else {
          const displayStyle = window.getComputedStyle(node.domNode)['display'];
          return displayStyle == 'block' || displayStyle == 'list-item';
        }
      };
      while(current.parent && current.parent.start >= start && current.parent.end <= end && ! isBlock(current)) {
        current = current.parent;
      }
      if (!domNodes.includes(current.domNode)) {
        nodes.push({richNode: current, range: [current.start, current.end], split:false});
        domNodes.push(current.domNode);
      }
    }
  }
  // clean up empty nodes at start and end
  let actualNodes = [];
  if (start === end) {
    // it's a position, just take the first element
    // TODO: this could be smarter
    actualNodes=[nodes[0]];
  }
  else {
    //adjacent check here
    actualNodes = nodes.filter( function(sel) {
      return !isEmptyRange(sel.range) || !isAdjacentRange(sel.range, selection.selectedHighlightRange);
    });
  }
  return actualNodes;
}

/**
 * apply a property to an existing dom node
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
  const tag = document.createElement(property.tagName);
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
  let nodesToApplyPropertyOn = findSuitableNodesToApplyOrCancelProperty(selection);
  for( let {richNode, range} of nodesToApplyPropertyOn) {
    const [start,end] = range;
    if (richNode.type ===  "tag" ) {
      if (richNode.start < start || richNode.end > end) {
        warn(`applyProperty does not support applying a property to a tag that only partially matches the range`, {id: "content-editable.highlight"});
      }
      else if (!domNodeContainsProperty(richNode.domNode, property)) {
        const domNode = richNode.domNode;
        let node;
        if (property.newContext) {
          node = createWrapperForProperty(property);
          domNode.prepend(node); // add node as child
          while(node.nextSibling) { // move other children to wrapper
            node.append(node.nextSibling);
          }
          wrapRichNode(richNode, node);
        }
        else {
          rawApplyProperty(richNode.domNode, property);
        }
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
        start: start,
        end: end,
        text: infixText,
        type: "tag"
      });
      infixRichNode.children = [ new RichNode({
        domNode: infixTextNode,
        parent: infixRichNode,
        start: start,
        end: end,
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
    else {
      warn( "applying a property can only occur on text nodes or on tag nodes", {id: "content-editable.editor-property"} );
    }
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
      if (tagName(richNode.domNode) === property.tagName && property.tagName !== DEFAULT_TAG_NAME) {
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
        const newRichNode = new RichNode({
          type: 'tag',
          domNode: newNode,
          start: richNode.start,
          end: richNode.end,
          children: richNode.children,
          parent: richNode.parent
        });
        replaceRichNodeWith(richNode, [newRichNode]);
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
  const tagNameMatch = property.tagName === tagName(domNode);
  let attributesMatch = true;
  for (let key of Object.keys(property.attributes)) {
    if (!domNode.hasAttribute(key) || domNode.getAttribute(key) !== new String(property.attributes[key]).toString()) {
      attributesMatch = false;
    }
  }
  for (let attribute of domNode.attributes) {
    if (!property.attributes[attribute.nodeName]) {
      attributesMatch = false;
    }
  }
  return tagNameMatch && attributesMatch;
}

/*
 * predicate to evaluate if a property matches a dom node, other attributes can be present on the dom node
 */
function domNodeContainsProperty(domNode, property) {
  const tagNameMatch = property.tagName === tagName(domNode);
  let attributesMatch = true;
  for (let key of Object.keys(property.attributes)) {
    if (!domNode.hasAttribute(key) || ! domNode.getAttribute(key).includes(property.attributes[key]))
      attributesMatch = false;
  }
  return (tagNameMatch || ! property.newContext) && attributesMatch; //TODO is this correct?!
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
  const nodesToCancelPropertyOn = findSuitableNodesToApplyOrCancelProperty(selection);
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
          const sel = doc.selectHighlight([ end+1, currentNode.end]);
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
        warn(`request to cancel a property, but it wasn't enabled`, {id: 'contenteditable.property'});
      }
    }
    else {
      warn( "cancelling a property can only occur on text nodes or on tag nodes", {id: "content-editable.editor-property"} );
    }
  }
}


export { cancelProperty, applyProperty }
