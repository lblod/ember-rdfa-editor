import {
  BackspaceHandlerManipulation,
  BackspacePlugin
} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import {
  ManipulationGuidance,
  MoveCursorToEndOfElementManipulation
} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import {editorDebug, moveCaretBefore} from '@lblod/ember-rdfa-editor/editor/utils';
import {isInLumpNode} from "@lblod/ember-rdfa-editor/utils/ce/lump-node-utils";

/**
 * This plugin jumps before uneditable elements
 */
export default class ContentEditableFalseBackspacePlugin implements BackspacePlugin {
  label = "backspace plugin to remove empty elements instead of jumping in";

  guidanceForManipulation(manipulation: BackspaceHandlerManipulation) : ManipulationGuidance | null {
    if (manipulation.type == "moveCursorToEndOfElement") {
      editorDebug(`plugins.contenteditable-false.guidanceForManipulation`, 'possible jump before element', manipulation.node);
      const element = manipulation.node ;
      if (! element.isContentEditable && ! isInLumpNode(element)) {
        // element is not editable
        editorDebug(`plugins.contenteditable-false.guidanceForManipulation`,'will jump');
        return {
          allow: true,
          executor: this.jumpBeforeElement
        };
      }
    }
    return null;
  }

  /**
   * executor that will move the cursor before the element we're supposed to jump into
   * and remove the element
   */
  jumpBeforeElement = ( manipulation: MoveCursorToEndOfElementManipulation) => {
    const element = manipulation.node;
    moveCaretBefore(element);
  };

  /**
   * allows the plugin to notify the backspace handler a change has occured.
   * currently never detects a change but rather lets the backspace handler do detection
   * @method detectChange
   */
  detectChange() : boolean {
    return false;
  }
}
