import HandlerResponse from './handler-response';

/**
 * Simple handler which allows us to ignore modifiers which yield a
 * keydown event, but don't have any meaning.
 * @class IgnoreModifiersHandler
 * @module contenteditable-editor
 * @constructor
 */

export default class IgnoreModifiersHandler {
  constructor({rawEditor}) {
    this.rawEditor = rawEditor;
  }

  isHandlerFor(event) {
    return ["Alt","Control","Meta","Shift"].find( (keyName) => keyName == event.key );
  }

  handleEvent() {
    return HandlerResponse.create(
      {
        allowPropagation: false
      }
    );
  }
}
