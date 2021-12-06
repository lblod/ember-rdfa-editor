import {
  BackspaceHandlerManipulation,
  BackspacePlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import {
  ManipulationGuidance,
  MoveCursorToEndOfElementManipulation,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import {
  editorDebug,
  moveCaretBefore,
} from '@lblod/ember-rdfa-editor/editor/utils';
import { isInLumpNode } from '@lblod/ember-rdfa-editor/utils/ce/lump-node-utils';

/**
 * This plugin jumps before uneditable elements.
 */
export default class ContentEditableFalseBackspacePlugin
  implements BackspacePlugin
{
  label = 'Backspace plugin to remove empty elements instead of jumping in';

  guidanceForManipulation(
    manipulation: BackspaceHandlerManipulation
  ): ManipulationGuidance | null {
    if (manipulation.type === 'moveCursorToEndOfElement') {
      const element = manipulation.node;
      editorDebug(
        'plugins.contenteditable-false.guidanceForManipulation',
        'possible jump before element',
        element
      );

      const rootNode = element.getRootNode() as HTMLElement;
      if (!element.isContentEditable && !isInLumpNode(element, rootNode)) {
        // Element is not editable.
        editorDebug(
          'plugins.contenteditable-false.guidanceForManipulation',
          'will jump'
        );

        return {
          allow: true,
          executor: this.jumpBeforeElement,
        };
      }
    }

    return null;
  }

  /**
   * Executor that will move the cursor before the element we're supposed to jump into
   * and remove the element.
   */
  jumpBeforeElement = (manipulation: MoveCursorToEndOfElementManipulation) => {
    moveCaretBefore(manipulation.node);
  };

  /**
   * Allows the plugin to notify the backspace handler a change has occurred.
   * Currently never detects a change but rather lets the backspace handler do detection.
   * @method detectChange
   */
  detectChange(): boolean {
    return false;
  }
}
