import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";


export default class InsertTableCommand extends Command {
  name = "insert-table";

  constructor(model: Model) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  execute(): void {

    const selection = this.model.selection;

    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const table = new ModelTable(2, 2);
    const firstCell = table.getCell(0, 0) as ModelElement;
    const range = selection.lastRange;
    this.model.change(mutator => {
      mutator.insertNodes(range, table);
      mutator.flush();
      const cursorPos = ModelPosition.fromInElement(firstCell, 0);
      const resultRange = new ModelRange(cursorPos, cursorPos);
      selection.selectRange(resultRange);

    }, false);
  }
}
