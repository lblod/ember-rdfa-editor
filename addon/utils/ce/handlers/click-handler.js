import EmberObject from '@ember/object';
import { reads } from '@ember/object/computed';
import HandlerResponse from './handler-response';
import { isInLumpNode, getNextNonLumpTextNode, animateLumpNode, getParentLumpNode } from '../lump-node-utils';

/**
 * Click Handler, a event handler to handle click events.
 * __Note__: Handling only happens in specific cases, all remaning will be dispatched to default content-editable behaviour.
 *
 * @module contenteditable-editor
 * @class ArrowHandler
 * @constructor
 * @extends EmberObject
 */
export default EmberObject.extend({
  currentSelection: reads('rawEditor.currentSelection'),

  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {DOMEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(event){
    return this.isMouseDownInLumpNode(event);
  },

  isMouseDownInLumpNode(event){
    return event.type === "mousedown" && isInLumpNode(event.target);
  },

  /**
   * handle click event
   * @method handleEvent
   * @return {Object} HandlerResponse.create({allowPropagation: false})
   * @public
   */
  handleEvent(event){
    if(this.isMouseDownInLumpNode(event)) {
      //Note: now only mousdown in lumpnode is taken care of. All remaining will be default content editable.
      const nextNode = this.setTargetOutsideLumpNode(event.target);
      this.rawEditor.updateRichNode();
      this.rawEditor.setCarret(nextNode, 0);
    }
    return HandlerResponse.create({ allowPropagation: false });
  },

  setTargetOutsideLumpNode(target) {
    animateLumpNode(getParentLumpNode(target));
    return getNextNonLumpTextNode(target, this.rawEditor.rootNode);
  }
});
