import {TabHandlerManipulation, TabInputPlugin} from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import {
  ManipulationGuidance
} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import ModelTable from '@lblod/ember-rdfa-editor/model/model-table';
import { PropertyState } from '@lblod/ember-rdfa-editor/model/util/types';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import PernetRawEditor from '../../ce/pernet-raw-editor';

/**
 *
 * @class TableBackspacePlugin
 * @module plugins/table
 */
export default class TableTabInputPlugin implements TabInputPlugin {
  label = 'backspace plugin for handling table nodes';

  guidanceForManipulation(manipulation: TabHandlerManipulation, editor: RawEditor) : ManipulationGuidance | null {
    const selection = editor.selection;
    if(selection.inTableState === PropertyState.enabled) {
      return {
        allow: true,
        executor: TableTabInputPlugin.tabHandler
      };
    } else {
      if(manipulation.type === 'moveCursorToStartOfElement' || manipulation.type === 'moveCursorAfterElement') {
        if(TableTabInputPlugin.isElementATable(manipulation.node)){
          return {
            allow: true,
            executor: TableTabInputPlugin.selectFirstCell,
          };
        }
      } else if (manipulation.type === 'moveCursorToEndOfElement' || manipulation.type === 'moveCursorBeforeElement') {
        if (TableTabInputPlugin.isElementATable(manipulation.node)) {
          return {
            allow: true,
            executor: TableTabInputPlugin.selectLastCell,
          };
        }
      }
    }

    return null;
  }

  static isElementATable(element: HTMLElement) {
    return tagName(element) === 'table';
  }

  static selectFirstCell(manipulation : TabHandlerManipulation, editor: PernetRawEditor) {
    const table = editor.model.getModelNodeFor(manipulation.node) as ModelTable;
    const firstCell = table.getCell(0,0);
    if (firstCell) {
      editor.selection.collapseIn(firstCell);
      editor.model.write();
    }
  }

  static selectLastCell(manipulation : TabHandlerManipulation, editor: PernetRawEditor) {
    const table = editor.model.getModelNodeFor(manipulation.node) as ModelTable;
    const {x, y} = table.getDimensions();
    const lastCell = table.getCell(x-1,y-1);
    if(lastCell) {
      editor.model.selection.collapseIn(lastCell);
      editor.model.write();
    }
  }

  static tabHandler(manipulation : TabHandlerManipulation, editor: PernetRawEditor) {
    let table;
    const selection = editor.selection;
    let selectedCell = ModelTable.getCellFromSelection(selection);
    if (!selectedCell) {
      throw new Error('Selection is not inside a cell');
    }
    const selectedIndex = ModelTable.getCellIndex(selectedCell);

    while (selectedCell?.parent) {
      const parent: ModelElement = selectedCell.parent ;
      if (parent.type === 'table') {
        table = parent as ModelTable;
        break;
      } else {
        selectedCell = parent;
      }
    }

    const tableDimensions = table?.getDimensions();
    if (!table || !tableDimensions) {
      throw new Error('Selection is not inside a table');
    }

    let newPosition;
    if (manipulation.type === 'moveCursorToStartOfElement' || manipulation.type === 'moveCursorAfterElement') {
      if (selectedIndex.x === tableDimensions.x - 1 && selectedIndex.y < tableDimensions.y - 1) {
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
        // at the end of the table
        if (table.nextSibling) {
          selection.collapseIn(table.nextSibling);
        } else {
          const text = new ModelText(INVISIBLE_SPACE);
          table.parent?.appendChildren(text);
          selection.collapseIn(text);
        }

        editor.model.write();
        return;
      }
    }
    else if (manipulation.type === 'moveCursorToEndOfElement' || manipulation.type === 'moveCursorBeforeElement') {
      if (selectedIndex.x === 0 && selectedIndex.y > 0) {
        newPosition = {
          x: tableDimensions.x - 1,
          y: selectedIndex.y - 1
        };
      } else if (selectedIndex.x > 0){
        newPosition = {
          x: selectedIndex.x - 1,
          y: selectedIndex.y
        };
      } else {
        if (table.previousSibling) {
          selection.collapseIn(table.previousSibling);
          editor.model.write();
        }
        return;
      }
    } else {
      return;
    }
    const newSelectedCell = table?.getCell(newPosition.x, newPosition.y);
    if (!newSelectedCell) return;
    selection.collapseIn(newSelectedCell);
    editor.model.write();
  }
}
