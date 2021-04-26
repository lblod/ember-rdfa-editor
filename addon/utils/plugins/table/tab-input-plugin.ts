import { TabInputPlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import {
  Manipulation,
  ManipulationExecutor,
  ManipulationGuidance
} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import RawEditor from 'dummy/utils/ce/raw-editor';
import ModelTable from '@lblod/ember-rdfa-editor/model/model-table';
import { PropertyState } from '@lblod/ember-rdfa-editor/model/util/types';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

/**
 *
 * @class TableBackspacePlugin
 * @module plugins/table
 */
export default class TableTabInputPlugin implements TabInputPlugin {
  label = 'backspace plugin for handling table nodes';

  guidanceForManipulation(_manipulation: Manipulation, editor: RawEditor) : ManipulationGuidance | null {
    const selection = editor.selection;
    if(selection.inTableState === PropertyState.enabled) {
      return {
        allow: true,
        executor: this.tabHandler as unknown as ManipulationExecutor
      };
    } else {
      if(_manipulation.type === 'moveCursorToStartOfElement' || _manipulation.type === 'moveCursorAfterElement') {
        if(this.isNextElementATable(selection)){
          return {
            allow: true,
            executor: this.selectFirstCell,
          }
        }
      } else if(_manipulation.type === 'moveCursorToEndOfElement' || _manipulation.type === 'moveCursorBeforeElement') {
        if(this.isPreviousElementATable(selection)){
          return {
            allow: true,
            executor: this.selectLastCell,
          }
        }
      }
    }
    return null;
  }

  isNextElementATable(selection: ModelSelection) {
    const nextSibling = selection.anchor?.nodeAfter() as ModelElement;
    if(!nextSibling) return false;
    return nextSibling.type === 'table';
  }

  isPreviousElementATable(selection: ModelSelection) {
    const previousSibling = selection.anchor?.nodeBefore() as ModelElement;
    if(previousSibling) {
      return previousSibling.type === 'table';
    } else {
      return false;
    }
  }

  selectFirstCell(manipulation : Manipulation, editor: RawEditor) {
    const selection = editor.selection;
    const table = selection.anchor?.nodeAfter() as ModelTable;
    const firstCell = table.getCell(0,0);
    selection.collapseOn(firstCell);
    editor.model.write();
  }

  selectLastCell(manipulation : Manipulation, editor: RawEditor) {
    const selection = editor.selection;
    const table = selection.anchor?.nodeBefore() as ModelTable;
    const {x, y} = table.getDimensions();
    const lastCell = table.getCell(x-1,y-1);
    selection.collapseOn(lastCell);
    editor.model.write();
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
      const parent: ModelElement = selectedCell.parent ;
      if(parent.type === 'table') {
        table = parent as ModelTable;
        break;
      } else {
        selectedCell = parent;
      }
    }

    const tableDimensions = table?.getDimensions();
    if(!table || !tableDimensions) {
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
        if(table.nextSibling) {
          const pos = ModelPosition.fromAfterNode(table);
          const range = new ModelRange(pos, pos);
          selection.selectRange(range);
          editor.model.write();
        }
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
        if(table.previousSibling) {
          const pos = ModelPosition.fromBeforeNode(table);
          const range = new ModelRange(pos, pos);
          selection.selectRange(range);
          editor.model.write();
        }
        return;
      }
    } else {
      return;
    }
    const newSelectedCell = table?.getCell(newPosition.x, newPosition.y);
    if(!newSelectedCell) return;
    selection.collapseOn(newSelectedCell);
    editor.model.write();
  };
}
