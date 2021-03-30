import { TabInputPlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {Manipulation, ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import RawEditor from 'dummy/utils/ce/raw-editor';
import ModelTable from '@lblod/ember-rdfa-editor/model/model-table';

/**
 *
 * @class TableBackspacePlugin
 * @module plugins/table
 */
export default class TableTabInputPlugin implements TabInputPlugin {
  label = 'backspace plugin for handling table nodes'

  guidanceForManipulation(manipulation: Manipulation, editor: RawEditor) : ManipulationGuidance | null {
    const selection = editor.selection;
    if(selection.isInTable) {
      return {
        allow: true,
        executor: this.tabHandler
      };
    }
    return null;
  }

  tabHandler(manipulation : Manipulation, editor: RawEditor) {
    let table;
    const selection = editor.selection;
    let selectedCell = ModelTable.getCellFromSelection(selection);
    if(!selectedCell) {
      throw new Error('Selection is not inside a cell');
    }
    const selectedIndex = ModelTable.getCellIndex(selectedCell);

    while(selectedCell?.parent) {
      const parent = selectedCell.parent as ModelElement;
      if(parent.type === 'table') {
        table = parent as ModelTable;
        break;
      } else {
        selectedCell = parent;
      }
    }
    
    const tableDimensions = table?.getDimensions();
    if(!tableDimensions) {
      throw new Error('Selection is not inside a table');
    }
    let newPosition;
    if(manipulation.type === 'moveCursorToStartOfElement' || manipulation.type === 'moveCursorAfterElement') {
      if(selectedIndex.x === tableDimensions.x - 1 && selectedIndex.y < tableDimensions.y - 1) {
        newPosition = {
          x: 0,
          y: selectedIndex.y + 1
        };
      } else if(selectedIndex.x < tableDimensions.x - 1){
        newPosition = {
          x: selectedIndex.x + 1,
          y: selectedIndex.y
        };
      } else {
        return;
      }
    } else if(manipulation.type === 'moveCursorToEndOfElement' || manipulation.type === 'moveCursorBeforeElement') {
      if(selectedIndex.x === 0 && selectedIndex.y > 0) {
        newPosition = {
          x: tableDimensions.x - 1,
          y: selectedIndex.y - 1
        };
      } else if(selectedIndex.x > 0){
        newPosition = {
          x: selectedIndex.x - 1,
          y: selectedIndex.y
        };
      } else {
        return;
      }
    } else {
      return;
    }
    const newSelectedCell = table?.getCell(newPosition.x, newPosition.y);
    if(!newSelectedCell) return;
    selection.collapseOn(newSelectedCell);
    editor.model.write();
  }

  /**
   * If the handler has been executed we had done nothing so we should return true if not we return false.
   * @method detectChange
   */
  detectChange(manipulation: Manipulation, editor: RawEditor) : boolean {
    const selection = editor.selection;
    const supportedManipulations = [
      'moveCursorToStartOfElement',
      'moveCursorAfterElement',
      'moveCursorToEndOfElement',
      'moveCursorBeforeElement'
    ];
    if(selection.isInTable && supportedManipulations.includes(manipulation.type) ) {
      return true;
    }
    return false;
  }

}
