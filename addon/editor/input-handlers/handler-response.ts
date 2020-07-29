export interface HandlerResponse {
  /**
   * specify if the event can also handled by another handler
   */
  allowPropagation: boolean

  /**
   * specify if the event can be handled by the browser
   */
  allowBrowserDefault: boolean | undefined
}
