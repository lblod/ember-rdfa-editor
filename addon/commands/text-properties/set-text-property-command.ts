import Command from '../command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { TextAttribute } from '@lblod/ember-rdfa-editor/model/model-text';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';

export default abstract class SetTextPropertyCommand extends Command {
  constructor(model: Model) {
    super(model);
  }

  protected setTextProperty(
    property: TextAttribute,
    value: boolean,
    selection: ModelSelection = this.model.selection
  ) {
    if (!ModelSelection.isWellBehaved(selection)) {
      console.info(
        'Not executing SetPropertyCommand because selection is missing'
      );
      return;
    }

    const range = selection.lastRange;

    this.model.change((mutator) => {
      const resultRange = mutator.setTextProperty(range, property, value);
      this.model.selectRange(resultRange);
    });
  }
}
