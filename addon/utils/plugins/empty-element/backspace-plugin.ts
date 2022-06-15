import { Editor } from '@lblod/ember-rdfa-editor/core/editor';
import {
  BackspaceHandlerManipulation,
  BackspacePlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import {
  ManipulationGuidance,
  MoveCursorToEndOfElementManipulation,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { moveCaretBefore } from '@lblod/ember-rdfa-editor/editor/utils';

/**
 * This plugin removes empty elements instead of jumping into them
 */
export default class EmptyElementBackspacePlugin implements BackspacePlugin {
  label = 'Backspace plugin to remove empty elements instead of jumping in';

  guidanceForManipulation(
    manipulation: BackspaceHandlerManipulation
  ): ManipulationGuidance | null {
    if (manipulation.type === 'moveCursorToEndOfElement') {
      const element = manipulation.node;
      if (element.innerText.length === 0) {
        // No visible text or height (br shows up as newline in innerText), so jump before and remove.
        return {
          allow: true,
          executor: this.jumpBeforeAndRemoveEmptyElement,
        };
      }
    }

    return null;
  }

  /**
   * Executor that will move the cursor before the element we're supposed to jump into
   * and remove the element.
   */
  jumpBeforeAndRemoveEmptyElement = (
    manipulation: MoveCursorToEndOfElementManipulation,
    editor: Editor
  ) => {
    const element = manipulation.node;
    moveCaretBefore(element);
    element.remove();
    const tr = editor.state.createTransaction();
    tr.readFromView(editor.view);
    editor.dispatchTransaction(tr, false);
  };

  /**
   * Allows the plugin to notify the backspace handler a change has occurred.
   * Currently never detects a change, but rather lets the backspace handler do detection.
   * @method detectChange
   */
  detectChange(): boolean {
    return false;
  }
}
