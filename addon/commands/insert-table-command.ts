import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";


export default class InsertTableCommand extends Command {
  name = "insert-table";

  constructor(model: Model) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(selection: ModelSelection = this.model.selection, rows = 2, columns = 2): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const table = new ModelTable(rows, columns);
    const firstCell = table.getCell(0, 0) as ModelElement;

    this.model.change(mutator => {
      mutator.insertNodes(selection.lastRange, table);
      selection.collapseIn(firstCell);
    });
  }
}
