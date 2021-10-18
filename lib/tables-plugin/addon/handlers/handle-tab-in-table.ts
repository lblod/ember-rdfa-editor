import ModelTable from "@lblod/ember-rdfa-editor/core/model/model-table";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import { PropertyState } from "@lblod/ember-rdfa-editor/util/types";

export default function HandleTabInTable(reverse: boolean, controller: EditorController) {
  const selection = controller.selection;
  if(selection.inTableState !== PropertyState.disabled) {
    let cell = ModelTable.getCellFromSelection(selection);

    if(!cell){
      throw new Error('Selection is not inside a cell');
    }

    const selectedIndex = ModelTable.getCellIndex(cell);
    let table;

    while(cell.parent) {
      const parent = cell.parent;
      if(parent.type === 'table') {
        table = cell.parent as ModelTable;
        break;
      } else {
        cell = parent as ModelElement;
      }
    }

    if(!table) {
      throw new Error('Selection is not inside a table');
    }

    const tableDimensions = table.getDimensions();
    

    let newPosition;
    if(reverse) {
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
        controller.executeCommand('move-to-previous-element', table);
        return;
      }
    } else {
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
        controller.executeCommand('move-to-next-element', table);
        return;
      }
    }

    if(!newPosition) return;

    controller.executeCommand('move-to-cell', table, newPosition.x, newPosition.y);
    

  }
}
