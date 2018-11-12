import BackspaceHandler from '@lblod/ember-contenteditable-editor/utils/backspace-handler';
import { isRdfaNode } from './rdfa-rich-node-helpers';
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
    this.rawEditor.externalDomUpdate('backspace', () => {
      const currentTextNode = this.rawEditor.currentNode;
      var cancelBackspace = false;
      if (this.nodeIsOnlyChild(currentTextNode) && this.visibleText(currentTextNode).length < 5) {
        cancelBackspace = this.setDataFlaggedForNode(currentTextNode);
      }
      if (cancelBackspace) {
        currentTextNode.text = ' ';
      }
      else {
        this.backSpace();
      }
    });
    return HandlerResponse.create({ allowPropagation: false });
  },

  nodeIsOnlyChild(node) {
    return node.parentNode.childNodes.length === 1;
  },

    /**
   * handles state of parent rdfa node
   * will return true if backspace needs to be avoided.
   * @method setDataFlaggedForNode
   * @param {DomNode} textNode
   * @return {boolean} can parentNode be removed
   * @private
   */
  setDataFlaggedForNode(node){
    const parentNode = node.parentNode;
    if (this.isRdfaNode(parentNode)) {
      const visibleLength = this.visibleText(node).length - 1;
      if (! this.isFlaggedForRemoval(parentNode) && visibleLength > 0) {
        parentNode.setAttribute('data-flagged-remove', 'almost-complete');
        return false;
      }
      if(! this.isFlaggedForRemoval(parentNode) && visibleLength === 0) {
        console.log('removed');
        parentNode.setAttribute('data-flagged-remove', 'complete');
        return true;
      }
      if(this.isFlaggedForRemoval(parentNode) && this.visibleText(node).length === 0) {
        parentNode.setAttribute('data-flagged-remove', 'complete');
        return false;
      }
    }
    return false;
  },

  /**
   * returns true if the node is flagged for removal
   * @method isFlaggedForRemoval
   * @param {DomNode} textNode
   * @return {Bool}
   * @private
   */
  isFlaggedForRemoval(node){
    return node.getAttribute('data-flagged-remove') === 'complete';
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
  }
});
