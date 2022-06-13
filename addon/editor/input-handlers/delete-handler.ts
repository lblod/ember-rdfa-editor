import { InputHandler } from './input-handler';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { isKeyDownEvent } from '@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers';
import { toFilterRejectFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';

/**
 * EnterHandler, an event handler to handle the generic enter case.
 *
 * @module contenteditable-editor
 * @class EnterHandler
 * @constructor
 */
export default class DeleteHandler extends InputHandler {
  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
  }

  isHandlerFor(event: Event) {
    return isKeyDownEvent(event) && event.key === 'Delete';
  }

  handleEvent(_: KeyboardEvent) {
    this.rawEditor.executeCommand('remove', 'right');
    console.log('DELETE AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    return { allowPropagation: true, allowBrowserDefault: false };
  }
}
