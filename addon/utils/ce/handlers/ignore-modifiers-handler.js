import EmberObject from '@ember/object';
import HandlerResponse from './handler-response';

/**
 * Simple handler which allows us to ignore modifiers which yield a
 * keydown event, but don't have any meaning.
 * @class IgnoreModifiersHandler
 * @module contenteditable-editor
 * @constructor
 */
export default EmberObject.extend( {

  /**
   * Yields a truethy value for all events which we can recognise as
   * being an unimportant key-press which is there to change state.
   *
   * Skips keyboard events for:
   * - Alt
   * - Control
   * - Meta
   * - Shift
   */
  isHandlerFor( event ){
    return ["Alt","Control","Meta","Shift"].find( (keyName) => keyName == event.key );
  },

  /**
   * There is no desire to actually handle this event.  Other inputs
   * may choose to also act on this behaviour, hence we allow
   * propagation.
   */
  handleEvent() {
    return HandlerResponse.create(
      {
        allowPropagation: false
      }
    );
  }
});
