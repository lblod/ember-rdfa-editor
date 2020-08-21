export interface HandlerResponse {
  /**
   * specify if the event can also handled by another handler
   * @property allowPropagation
   * @type boolean
   * @default true
   * @public
   */
  allowPropagation: boolean
}


export interface InputHandler {
  isHandlerFor: (event: Event) => boolean
  handleEvent: (event: Event) => HandlerResponse
}
