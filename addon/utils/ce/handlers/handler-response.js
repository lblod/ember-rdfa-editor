/**
 * response object for event handlers
 */
export default class HandlerResponse {
  /**
   * specify if the event can be handled by another handler
   * @property allowPropagation
   * @type boolean
   * @default true
   * @public
   */
  allowPropagation = true;
  /**
   * specify if the event can be handled by the browser
   * @property allowBrowserDefault
   * @type boolean
   * @default false
   * @public
   */
  allowBrowserDefault = false;
}
