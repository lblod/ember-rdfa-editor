import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import ModelTable from "@lblod/ember-rdfa-editor/core/model/model-table";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";


export default class InsertTableCommand extends Command<[ModelSelection, number, number], void> {
  name = "insert-table";

  constructor(model: EditorModel) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  execute(executedBy: string, selection: ModelSelection = this.model.selection, rows = 2, columns = 2): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const table = new ModelTable(rows, columns);
    const firstCell = table.getCell(0, 0) as ModelElement;

    this.model.change(executedBy, mutator => {
      mutator.insertNodes(selection.lastRange, table);
      selection.collapseIn(firstCell);
    });
  }
}
