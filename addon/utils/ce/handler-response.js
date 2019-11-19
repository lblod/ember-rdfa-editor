import EmberObject from '@ember/object';

/**
 * response object for event handlers
 * @module contenteditable-editor
 * @class HandlerResponse
 * @constructor
 * @extends EmberObject
 */
export default EmberObject.extend({
  /**
   * specify if the event can be handled by another handler
   * @property allowPropagation
   * @type boolean
   * @default true
   * @public
   */
  allowPropagation: true,
  /**
   * specify if the event can be handled by the browser
   * @property allowBrowserDefault
   * @type boolean
   * @default false
   * @public
   */
  allowBrowserDefault: false
});
