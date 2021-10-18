import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import ModelTable from "@lblod/ember-rdfa-editor/core/model/model-table";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";


export default class RemoveTableColumnCommand extends Command<[ModelSelection], void> {
  name = "remove-table-column";

  constructor(model: EditorModel) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  execute(executedBy: string, selection: ModelSelection = this.model.selection): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const cell = ModelTable.getCellFromSelection(selection);
    if (!cell) {
      throw new Error('The selection is not inside a cell');
    }

    const table = ModelTable.getTableFromSelection(selection);
    if (!table) {
      throw new Error('The selection is not inside a table');
    }

    const position = ModelTable.getCellIndex(cell);
    if (!position || position.x === null) {
      //Shouldn't happen
      throw new Error('Position is null');
    }

    const tableDimensions = table.getDimensions();
    if (position.x === 0 && tableDimensions.x === 1) {
      this.model.change(executedBy, mutator => {
        table.removeTable(mutator);
      });
    } else {
      const cellXToSelect = position.x === tableDimensions.x - 1
        ? position.x - 1
        : position.x;

      const cellToSelect = table.getCell(cellXToSelect, position.y);

      this.model.change(executedBy, mutator => {
        if (cellToSelect) {
          selection.collapseIn(cellToSelect);
        }
        table.removeColumn(mutator, position.x);
      });
    }
  }
}
