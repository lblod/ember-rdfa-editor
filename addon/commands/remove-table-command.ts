import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";


export default class RemoveTableCommand extends Command {
  name = "remove-table";

  constructor(model: Model) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  execute(): void {

    const selection= this.model.selection;
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const table = ModelTable.getTableFromSelection(selection);

    if(!table) {
      throw new Error('The selection is not inside a table');
    }

    if(table.parent) {
      const offset = table.parent.getChildIndex(table);
      if(offset) {
        selection.collapseIn(table.parent, offset);
      } else {
        selection.collapseIn(table.parent);
      }
      this.model.write();
    }

    table.removeTable();

    this.model.write();
  }
}
