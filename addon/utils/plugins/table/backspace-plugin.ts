import {
  BackspaceHandlerManipulation,
  BackspacePlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import { ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { PropertyState } from '@lblod/ember-rdfa-editor/model/util/types';
import { Editor } from '@lblod/ember-rdfa-editor/core/editor';

/**
 *
 * @class TableBackspacePlugin
 * @module plugins/table
 */
export default class TableBackspacePlugin implements BackspacePlugin {
  label = 'backspace plugin for handling table nodes';

  guidanceForManipulation(
    manipulation: BackspaceHandlerManipulation,
    editor: Editor
  ): ManipulationGuidance | null {
    const voidExecutor = {
      allow: false,
      executor: undefined,
    };

    const selection = editor.state.selection;
    if (selection.inTableState === PropertyState.enabled) {
      if (
        manipulation.type === 'moveCursorBeforeElement' ||
        manipulation.type === 'removeEmptyElement'
      ) {
        return voidExecutor;
      } else if (manipulation.type === 'removeEmptyTextNode') {
        if (manipulation.node.parentElement?.childElementCount === 0) {
          return voidExecutor;
        }
      }
    }

    return null;
  }

  /**
   * If the handler has been executed we had done nothing so we should return true if not we return false.
   * @method detectChange
   */
  detectChange(
    manipulation: BackspaceHandlerManipulation,
    editor: Editor
  ): boolean {
    const selection = editor.state.selection;
    if (selection.inTableState === PropertyState.enabled) {
      if (
        manipulation.type === 'moveCursorBeforeElement' ||
        manipulation.type === 'removeEmptyElement'
      ) {
        return true;
      } else if (manipulation.type === 'removeEmptyTextNode') {
        return manipulation.node.parentElement?.childElementCount === 0;
      }
    }

    return false;
  }
}
