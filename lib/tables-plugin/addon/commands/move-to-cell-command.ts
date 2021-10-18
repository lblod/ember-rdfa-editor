import ModelTable from "@lblod/ember-rdfa-editor/core/model/model-table";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";

export default class MoveToCellCommand extends Command<[ModelTable, number, number], void> {
  name = 'move-to-cell';

  constructor(model: EditorModel) {
    super(model);
  }

  execute(executedBy: string, table: ModelTable, xPosition: number, yPosition: number) {
    const cell = table.getCell(xPosition, yPosition);
    if(cell) {
      this.model.change(executedBy, _ => {
        this.model.selection.collapseIn(cell);
      });
    }
  }
}
