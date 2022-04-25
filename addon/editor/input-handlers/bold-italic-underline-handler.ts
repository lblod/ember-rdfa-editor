import { InputHandler } from './input-handler';
import PernetRawEditor from '@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor';
import { isKeyDownEvent } from '@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers';

/**
 * BoldItalicUnderlineHandler, an event to add/remove the bold, italic or underline property to/from text.
 *
 * @module contenteditable-editor
 * @class BoldItalicUnderlineHandler
 * @constructor
 */
export default class BoldItalicUnderlineHandler extends InputHandler {
  isBold = false;
  isItalic = false;
  isUnderline = false;
  isStrikethrough = false;

  constructor({ rawEditor }: { rawEditor: PernetRawEditor }) {
    super(rawEditor);
  }

  isHandlerFor(event: Event) {
    return (
      isKeyDownEvent(event) &&
      (event.ctrlKey || event.metaKey) &&
      ['b', 'i', 'u'].includes(event.key)
    );
  }

  handleEvent(event: KeyboardEvent) {
    const selection = this.rawEditor.model.selection;
    let markName;
    switch (event.key) {
      case 'b':
        markName = 'bold';
        break;
      case 'u':
        markName = 'underline';
        break;
      case 'i':
        markName = 'italic';
        break;
    }

    if (markName) {
      if (selection.hasMark(markName)) {
        this.rawEditor.executeCommand(
          'remove-mark-from-selection',
          markName,
          {}
        );
      } else {
        this.rawEditor.executeCommand('add-mark-to-selection', markName, {});
      }
      return { allowBrowserDefault: false, allowPropagation: false };
    } else {
      return { allowBrowserDefault: true, allowPropagation: true };
    }
  }
}
