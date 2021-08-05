export interface HandlerResponse {
  /**
   * Specify if the event can also handled by another handler.
   */
  allowPropagation: boolean

  /**
   * Specify if the event can be handled by the browser.
   */
  allowBrowserDefault?: boolean
}
