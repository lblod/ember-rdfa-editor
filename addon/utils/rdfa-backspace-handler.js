import BackspaceHandler from '@lblod/ember-contenteditable-editor/utils/backspace-handler';
import getRichNodeMatchingDomNode from '@lblod/ember-contenteditable-editor/utils/get-rich-node-matching-dom-node';
import { isRdfaNode } from './rdfa-rich-node-helpers';
import { isVoidElement } from '@lblod/ember-contenteditable-editor/utils/dom-helpers';
import HandlerResponse from '@lblod/ember-contenteditable-editor/utils/handler-response';
import NodeWalker from '@lblod/ember-contenteditable-editor/utils/node-walker';

/**
 * Rdfa Backspace Handler, a event handler to handle backspaces while taking rdfa into account
 *
 * @module editor-core
 * @class RdfaBackspaceHandler
 * @constructor
 * @extends EmberObject
 */

export default BackspaceHandler.extend({
  /**
   * handle backspace event on rdfa content
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent() {
    let position = this.get('currentSelection')[0];
    let textNode = this.get('rawEditor.currentNode');
    let richNode = this.get('rawEditor').getRichNodeFor(textNode);

    this.get('rawEditor').externalDomUpdate('rdfa backspace', () => {
      //enter relative space
      let relPosition = this.absoluteToRelativePosition(richNode, position);

      //the string provided by DOM does not match what is rendered on screen. Basically, a bunch of invisible chars should be removed.
      let preProcessedDomAndPosition = this.textNodeAndCursorPositionToRendered(textNode, relPosition);
      //effective backspace handling, i.e. what user expects to see when pressing backspace
      let processedDomAndPosition = this.removeCharToLeftAndUpdatePosition(preProcessedDomAndPosition.textNode, preProcessedDomAndPosition.position);
      // post processing
      let postProcessedDomAndPosition = this.postProcessTextNode(processedDomAndPosition.textNode, processedDomAndPosition.position);

      // if 2 chars left of a text node richt after A RDFANode should be flagged
      if(this.isAlmostEmptyFirstChildFromRdfaNodeAndNotFlaggedForRemoval(textNode)){
        let newNode = this.setDataFlaggedForNode(postProcessedDomAndPosition.textNode);
        this.get('rawEditor').updateRichNode();
        let newRichNode = getRichNodeMatchingDomNode(newNode, this.get('richNode'));
        this.set('rawEditor.currentNode', newRichNode.domNode);
        this.get('rawEditor').setCurrentPosition(newRichNode.end);
      }
      //if empty text node, we start cleaning the DOM tree (with specific RDFA flow in mind)
      else if(this.isEmptyTextNode(postProcessedDomAndPosition.textNode)){
        let newNode = this.rdfaDomCleanUp(postProcessedDomAndPosition.textNode);
        this.get('rawEditor').updateRichNode();
        let newRichNode = getRichNodeMatchingDomNode(newNode, this.get('richNode'));
        this.set('rawEditor.currentNode', newRichNode.domNode);
        this.get('rawEditor').setCurrentPosition(newRichNode.end);
      }

      else {
        //else we update position and update current position
        this.get('rawEditor').updateRichNode();
        let newAbsolutePosition = this.relativeToAbsolutePosition(richNode, postProcessedDomAndPosition.position);
        this.set('rawEditor.currentNode', postProcessedDomAndPosition.textNode);
        this.get('rawEditor').setCurrentPosition(newAbsolutePosition);

        //TODO: is it possible that we end up in an empty text node?
      }
    });
    return HandlerResponse.create({allowPropagation: false});
  },

  /**
   * Basically we want to flag text nodes, almost
   * empty (but not empty) which are first child of RDFA node
   * e.g.
   * <h1 property="eli:title">Me</h1> will return true
   * <h1 property="eli:title" data-flagged-remove='almost-complete'>Me</h1> will return false
   * @method isAlmostEmptyFirstChildFromRdfaNodeAndNotFlaggedForRemoval
   * @param {DomNode} textNode
   * @return {Bool}
   * @private
   */
  isAlmostEmptyFirstChildFromRdfaNodeAndNotFlaggedForRemoval(node){
    return this.isAlmostEmptyFirstChildFromRdfaNode(node) && !node.parentNode.getAttribute('data-flagged-remove');
  },

  /**
   * e.g.
   * <h1 property="eli:title">[EMPTY TEXTNODE]</h1> will return true
   * <h1 property="eli:title">[A NODE][EMPTY TEXTNODE]</h1> will return false
   * @method isEmptyFirstChildFromRdfaNodeAndNotFlaggedForRemoval
   * @param {DomNode} textNode
   * @return {Bool}
   * @private
   */
  isEmptyFirstChildFromRdfaNodeAndNotFlaggedForRemoval(node){
    return !node.parentNode.getAttribute('data-flagged-remove') && this.isNodeFirstBornRdfaNode(node) && this.isEmptyTextNode(node);
  },

  /**
   * e.g
   * <h1 property="eli:title">Me</h1> will return true
   * <h1 property="eli:title"></h1> will return false
   * <h1 property="eli:title">Felix</h1> will return false
   * see implementation for length treshold
   * @method isAlmostEmptyFirstChildFromRdfaNode
   * @param {DomNode} textNode
   * @return {Bool}
   * @private
   */
  isAlmostEmptyFirstChildFromRdfaNode(node){
    let isFirstChild = this.isNodeFirstBornRdfaNode(node);
    return node.nodeType === Node.TEXT_NODE && node.textContent.trim().length < 3 && !this.isEmptyTextNode(node) && isFirstChild;
  },

  /**
   * <h1 property="eli:title">[NODE_TO_CHECK]</h1> will return true
   * <h1 property="eli:title">[SOME OTHER NODES][NODE_TO_CHECK]</h1> returns false
   * @method isNodeFirstBornRdfaNode
   * @param {DomNode} textNode
   * @return {Bool}
   * @private
   */
  isNodeFirstBornRdfaNode(node){
    let isParentRdfaNode = this.isRdfaNode(node.parentNode);
    let firstChild = node.parentNode.firstChild.isSameNode(node);
    return firstChild && isParentRdfaNode;
  },

  /**
   * returns true if rdfa node
   * @method isRdfaNode
   * @param {DomNode} textNode
   * @return {Bool}
   * @private
   */
  isRdfaNode(node){
    let nodeWalker = NodeWalker.create();
    return isRdfaNode(nodeWalker.processDomNode(node));
  },

  /**
   * e.g.
   * <div> <meta property="eli:title"/>[SOME NODES] </div> will return true
   * <div>[SOME NODES] <meta property="eli:title"/> </div> will return false
   * @method isVoidRdfaElementAndHasNextSibling
   * @param {DomNode} textNode
   * @return {Bool}
   * @private
   */
  isVoidRdfaElementAndHasNextSibling(node){
    return this.isRdfaNode(node) && isVoidElement(node) && node.nextSibling;
  },

  /**
   * cleans up DOM when pressing backspace and being in an empty node. Takes into account some side RDFA conditions.
   * @method rdfaDomCleanUp
   * @param {DomNode} textNode
   * @return {DomNode} domNode we will use to provide position
   * @private
   */
  rdfaDomCleanUp(domNode){
    let isEmptyRdfaOrEmptyTextNode = node => {
      return this.isParentFlaggedForAlmostRemoval(node) ||
        this.isEmptyFirstChildFromRdfaNodeAndNotFlaggedForRemoval(node) ||
        this.isTextNodeWithContent(node);
    };
    let matchingDomNode = this.cleanLeavesToLeftUntil(isEmptyRdfaOrEmptyTextNode, this.isVoidRdfaElementAndHasNextSibling.bind(this), domNode);

    if(this.isParentFlaggedForAlmostRemoval(matchingDomNode) || this.isEmptyFirstChildFromRdfaNodeAndNotFlaggedForRemoval(matchingDomNode)){
      matchingDomNode = this.setDataFlaggedForNode(matchingDomNode);
    }

    return matchingDomNode;
  }


});
