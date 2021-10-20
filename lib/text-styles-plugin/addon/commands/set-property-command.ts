import {TextAttribute} from "@lblod/ember-rdfa-editor/core/model/model-text";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";

export default abstract class SetPropertyCommand<A extends unknown[]> extends Command<A, void> {
  constructor(model: EditorModel) {
    super(model);
  }

  protected setProperty(executedBy: string, property: TextAttribute, value: boolean, range: ModelRange | null= this.model.selection.lastRange, affectSelection = true) {
    if (!range) {
      console.warn("set-property called without range, doing nothing");
      return;
    }

    this.model.change(executedBy, mutator => {
      const resultRange = mutator.setTextProperty(range, property, value);
      if (affectSelection) {
        this.model.selection.selectRange(resultRange);
      }
    });
  }
}
