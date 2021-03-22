import { BackspacePlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler';
import {Manipulation, ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import RawEditor from 'dummy/utils/ce/raw-editor';

/**
 *
 * @class TableBackspacePlugin
 * @module plugins/table
 */
export default class TableBackspacePlugin implements BackspacePlugin {
  label = 'backspace plugin for handling table nodes'

  guidanceForManipulation(manipulation: Manipulation, editor: RawEditor) : ManipulationGuidance | null {
    const voidExecutor = {
      allow: true,
      executor: this.removeInTable
    };
    const selection = editor.model.selection;
    if(selection.isInTable) {
      if(manipulation.type === 'moveCursorBeforeElement') {
        return voidExecutor;
      } else if(manipulation.type === 'removeEmptyTextNode') {
        if(manipulation.node.parentElement?.childElementCount === 0) {
          return voidExecutor;
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
  }

  /**
   * This executor does nothing when we are trying to remove an empty text node.
   * @method removeInTable
   */
  removeInTable() : void {
    return;
  }

  /**
   * If the handler has been executed we had done nothing so we should always return true.
   * @method detectChange
   */
  detectChange() : boolean {
    return true;
  }

}
