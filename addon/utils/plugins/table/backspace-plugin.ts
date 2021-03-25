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
      allow: false,
      executor: undefined
    };
    const selection = editor.selection;
    if(selection.isInTable) {
      if(manipulation.type === 'moveCursorBeforeElement' || manipulation.type === 'removeEmptyElement') {
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
    return null;
  }

  /**
   * If the handler has been executed we had done nothing so we should return true if not we return false.
   * @method detectChange
   */
  detectChange(manipulation: Manipulation, editor: RawEditor) : boolean {
    const selection = editor.selection;
    if(selection.isInTable) {
      if(manipulation.type === 'moveCursorBeforeElement' || manipulation.type === 'removeEmptyElement') {
        return true;
      } else if(manipulation.type === 'removeEmptyTextNode') {
        if(manipulation.node.parentElement?.childElementCount === 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return false;
  }

}
