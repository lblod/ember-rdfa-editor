import { isKeyDownEvent } from '@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers';
import BackspaceDeleteHandler from './backspace-delete-handler';

/**
 * EnterHandler, an event handler to handle the generic enter case.
 *
 * @module contenteditable-editor
 * @class EnterHandler
 * @constructor
 */
export default class BackspaceHandler extends BackspaceDeleteHandler {
  direction = -1;
  isHandlerFor(event: Event) {
    return isKeyDownEvent(event) && event.key === 'Backspace';
  }
}
