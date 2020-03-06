import { warn } from '@ember/debug';

/**
 * Fake class to list helper functions
 * these functions can be used from the editor : editor.{function}
 *
 * OPERATION API
 *
 * @module contenteditable-editor
 * @class Operation
 * @constructor
 */

/**
 * Replaces a DOM node
 *
 * This raw method replaces a DOM node in a callback.  This allows
 * the raw editor to prepare for the brute change and to alter the
 * contents.  It should be used as a last resort.
 *
 * Callback is used if the editor can prepare itself for the change.
 * failedCallback is called when the editor cannot execute the
 * change.
 *
 * - domNode: Node which will be altered
 * - callback: Function which should execute the dom node
 *   alteration.  This function receives the DOM node which was
 *   supplied earlier as a first argument.
 * - failedCallback: Function which will be executed if the callback
 *   could not be executed.  It receives the dom Node and an
 *   explanation as to why the execution could not happen
 * - motivation: Obligatory statement explaining why you need
 *   replaceDomNode and cannot use one of the other methods.
 *
 * @method replaceDomNode
 * @param {DomNode} domNode
 * @param {callback, failedCallback, motivation} callback, failedCallback, motivation
 * @public
 */
function replaceDomNode( domNode, { callback, failedCallback, motivation } ){
  const richNode = this.getRichNodeFor(domNode);
  if (richNode) {
    const currentNode = this.currentNode;
    const relativePosition = this.getRelativeCursorPosition();
    warn(`Replacing DOM node: ${motivation}`, { id: 'contenteditable.replaceDomNode'});
    callback(domNode);
    this.updateRichNode();
    if (this.rootNode.contains(currentNode)) {
      this.setCarret(currentNode,relativePosition);
    }
    else {
      this.updateSelectionAfterComplexInput();
    }
    this.generateDiffEvents.perform();
  }
  else {
    failedCallback(domNode, 'DOM node not found in richNode');
  }
}

export {
  replaceDomNode
}
