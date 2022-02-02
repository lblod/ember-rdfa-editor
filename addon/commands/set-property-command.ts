import SetPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelSelection from '../model/model-selection';

export default class RemoveUnderlineCommand extends SetPropertyCommand {
  name = 'set-property';
  @logExecute
  execute(
    property: string,
    value: string,
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
      const resultRange = mutator.setProperty(range, property, value);
      this.model.selectRange(resultRange);
    });
  }
}
