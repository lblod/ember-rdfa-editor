import {TextAttribute} from "@lblod/ember-rdfa-editor/core/model/model-text";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";

export default abstract class SetPropertyCommand<A extends unknown[]> extends Command<A, void> {
  constructor(model: EditorModel) {
    super(model);
  }

  protected setProperty(executedBy: string, property: TextAttribute, value: boolean, selection: ModelSelection = this.model.selection, affectSelection = true) {


    if (!ModelSelection.isWellBehaved(selection)) {
      console.info("Not executing SetPropertyCommand because selection is missing");
      return;
    }

    const range = selection.lastRange;

    this.model.change(executedBy, mutator => {
      const resultRange = mutator.setTextProperty(range, property, value);
      if (affectSelection) {
        this.model.selection.selectRange(resultRange);
      }
    });
  }
}
